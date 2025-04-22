import { useState, useCallback, useEffect } from 'react';
import Constants from 'expo-constants';

// API URL 설정
const API_URL = Constants.expoConfig?.extra?.apiUrl;
console.log('API_URL:', API_URL); // 디버깅: API URL 확인

// 게시글 인터페이스
export interface Post {
  comm_number: number;
  user_id: number;
  comm_title: string;
  comm_detail: string;
  created_at: string;
  commentCount: number;
}

// 페이지 정보 인터페이스
interface PageInfo {
  hasNextPage: boolean;
  nextCursor: number | null;
}

// API 응답 인터페이스
interface ApiResponse {
  data: Post[];
  pageInfo: PageInfo;
}

export const usePosts = () => {
  // 상태 정의
  const [posts, setPosts] = useState<Post[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>({ hasNextPage: false, nextCursor: null });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 디버깅: 상태 변화 감지
  useEffect(() => {
    console.log('Current posts:', posts);
    console.log('Current pageInfo:', pageInfo);
    console.log('Current error:', error);
  }, [posts, pageInfo, error]);

  // 게시글 가져오기
  const fetchPosts = useCallback(
    async (cursor?: number) => {
      console.log('fetchPosts called with cursor:', cursor); // 디버깅: 함수 호출 확인
      setIsLoading(true);
      try {
        const url = `${API_URL}/communities/posts${cursor ? `?cursor=${cursor}` : ''}`;
        console.log('Fetching from URL:', url); // 디버깅: 요청 URL 확인

        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        console.log('Response status:', response.status); // 디버깅: 응답 상태 확인
        if (!response.ok) {
          const errorText = await response.text();
          console.log('Error response:', errorText); // 디버깅: 에러 응답 확인
          throw new Error(`Failed to load posts: ${response.status} - ${errorText}`);
        }

        const result: ApiResponse = await response.json();
        console.log('API result:', result); // 디버깅: API 응답 데이터 확인

        const newPosts = result.data.map((post) => ({
          comm_number: post.comm_number,
          user_id: post.user_id,
          comm_title: post.comm_title,
          comm_detail: post.comm_detail,
          created_at: post.created_at,
          commentCount: post.commentCount,
        }));

        console.log('New posts:', newPosts); // 디버깅: 매핑된 게시글 확인

        setPosts((prev) => {
          const updatedPosts = cursor ? [...prev, ...newPosts] : newPosts;
          console.log('Updated posts:', updatedPosts); // 디버깅: 상태 업데이트 확인
          return updatedPosts;
        });

        setPageInfo(result.pageInfo);
        console.log('Updated pageInfo:', result.pageInfo); // 디버깅: 페이지 정보 업데이트 확인
        setError(null);
      } catch (err: any) {
        console.error('Fetch error:', err.message); // 디버깅: 에러 로그
        setError(`게시글 불러오기에 실패했습니다: ${err.message}`);
      } finally {
        setIsLoading(false);
        console.log('isLoading set to false'); // 디버깅: 로딩 상태 변경
      }
    },
    []
  );

  // 초기 데이터 로드
  const loadInitialPosts = useCallback(() => {
    console.log('loadInitialPosts called'); // 디버깅: 초기 로드 호출 확인
    setPosts([]); // 기존 게시글 초기화
    fetchPosts();
  }, [fetchPosts]);

  // 다음 페이지 로드
  const loadMore = useCallback(() => {
    console.log('loadMore called, hasNextPage:', pageInfo.hasNextPage, 'nextCursor:', pageInfo.nextCursor); // 디버깅: 더보기 호출 확인
    if (pageInfo.hasNextPage && pageInfo.nextCursor && !isLoading) {
      fetchPosts(pageInfo.nextCursor);
    } else {
      console.log('Cannot load more: no next page or already loading'); // 디버깅: 더보기 조건 불만족
    }
  }, [pageInfo, isLoading, fetchPosts]);

  // 반환 객체
  return {
    posts,
    pageInfo,
    isLoading,
    error,
    loadInitialPosts,
    loadMore,
  };
};