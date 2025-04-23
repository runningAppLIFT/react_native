import { useState, useCallback, useEffect } from 'react';
import Constants from 'expo-constants';

// API URL 설정
const API_URL = Constants.expoConfig?.extra?.apiUrl;
console.log('API_URL:', API_URL);

// 게시글 인터페이스
export interface Post {
  comm_number: number;
  user_id: number;
  comm_title: string;
  comm_detail: string;
  created_at: string;
  commentCount: number;
  nickname: string; // 사용자 닉네임
  is_notice: boolean; // 공지 여부를 나타내는 필드 추가
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [notices, setNotices] = useState<Post[]>([]); // 공지사항 상태 추가
  const [pageInfo, setPageInfo] = useState<PageInfo>({ hasNextPage: false, nextCursor: null });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 디버깅: 상태 변화 감지
  useEffect(() => {
    console.log('Current posts:', posts);
    console.log('Current notices:', notices);
    console.log('Current pageInfo:', pageInfo);
    console.log('Current error:', error);
  }, [posts, notices, pageInfo, error]);

  // 게시글 가져오기
  const fetchPosts = useCallback(
    async (cursor?: number) => {
      console.log('fetchPosts called with cursor:', cursor);
      setIsLoading(true);
      try {
        const url = `${API_URL}/communities/posts${cursor ? `?cursor=${cursor}` : ''}`;
        console.log('Fetching from URL:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        console.log('Response status:', response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.log('Error response:', errorText);
          throw new Error(`Failed to load posts: ${response.status} - ${errorText}`);
        }

        const result: ApiResponse = await response.json();
        console.log('API result:', result);

        const newPosts = result.data.map((post) => ({
          comm_number: post.comm_number,
          user_id: post.user_id,
          comm_title: post.comm_title,
          comm_detail: post.comm_detail,
          created_at: post.created_at,
          commentCount: post.commentCount,
          nickname: post.nickname,
          is_notice: post.is_notice || false, // API에서 is_notice 제공, 없으면 false
        }));

        console.log('New posts:', newPosts);

        // 공지사항과 일반 게시글 분리
        const newNotices = newPosts.filter((post) => post.is_notice);
        const regularPosts = newPosts.filter((post) => !post.is_notice);

        setNotices((prev) => {
          const updatedNotices = cursor ? [...prev, ...newNotices] : newNotices;
          console.log('Updated notices:', updatedNotices);
          return updatedNotices;
        });

        setPosts((prev) => {
          const updatedPosts = cursor ? [...prev, ...regularPosts] : regularPosts;
          console.log('Updated posts:', updatedPosts);
          return updatedPosts;
        });

        setPageInfo(result.pageInfo);
        console.log('Updated pageInfo:', result.pageInfo);
        setError(null);
      } catch (err: any) {
        console.error('Fetch error:', err.message);
        setError(`게시글 불러오기에 실패했습니다: ${err.message}`);
      } finally {
        setIsLoading(false);
        console.log('isLoading set to false');
      }
    },
    []
  );

  // 초기 데이터 로드
  const loadInitialPosts = useCallback(() => {
    console.log('loadInitialPosts called');
    setPosts([]);
    setNotices([]); // 공지사항 초기화
    fetchPosts();
  }, [fetchPosts]);

  // 다음 페이지 로드
  const loadMore = useCallback(() => {
    console.log('loadMore called, hasNextPage:', pageInfo.hasNextPage, 'nextCursor:', pageInfo.nextCursor);
    if (pageInfo.hasNextPage && pageInfo.nextCursor && !isLoading) {
      fetchPosts(pageInfo.nextCursor);
    } else {
      console.log('Cannot load more: no next page or already loading');
    }
  }, [pageInfo, isLoading, fetchPosts]);

  return {
    posts,
    notices, // 공지사항 반환
    pageInfo,
    isLoading,
    error,
    loadInitialPosts,
    loadMore,
  };
};