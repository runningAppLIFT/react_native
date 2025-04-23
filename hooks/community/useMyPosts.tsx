import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../authContext'; // AuthContext 파일에서 가져옴
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl;

// 게시글 데이터의 타입 정의
export interface Post {
  comm_number: number;
  user_id: number;
  comm_title: string;
  comm_detail: string;
  created_at: string;
  modify_at: string | null;
  status: 'create' | 'modify' | 'delete';
  is_notice: boolean;
  commentCount: number; // UI에서 commentCount로 사용
}

// 훅의 반환 타입 정의
interface UseMyPostsResult {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  loadInitialPosts: () => Promise<void>;
  loadMore: () => Promise<void>;
  pageInfo: { hasNextPage: boolean; nextCursor: number | null };
}

export const useMyPosts = (): UseMyPostsResult => {
  const { user } = useAuth(); // AuthContext에서 user 정보 가져오기
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<{ hasNextPage: boolean; nextCursor: number | null }>({
    hasNextPage: false,
    nextCursor: null,
  });

  // 게시글 데이터를 가져오는 함수
  const fetchPosts = useCallback(
    async () => {
      if (!user || !user.userId) {
        setError('로그인이 필요합니다.');
        setPosts([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const url = `${API_URL}/communities/users/${user.userId}`;
        console.log('Fetching URL:', url); // 디버깅: 요청 URL
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status); // 디버깅: 응답 상태
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to load posts: ${response.status} - ${errorText}`);
        }

        const result: Post[] = await response.json();
        console.log('API response:', result); // 디버깅: 응답 데이터

        // 응답이 배열인지 확인
        if (!Array.isArray(result)) {
          throw new Error('Invalid response format: expected an array');
        }

        const newPosts: Post[] = result.map((item) => ({
          comm_number: item.comm_number,
          user_id: item.user_id,
          comm_title: item.comm_title,
          comm_detail: item.comm_detail,
          created_at: item.created_at,
          modify_at: item.modify_at,
          status: item.status,
          is_notice: item.is_notice,
          commentCount: item.commentsCount, // API의 commentsCount를 commentCount로 매핑
        }));

        // 삭제된 게시글 제외
        const filteredPosts = newPosts.filter((post) => post.status !== 'delete');

        setPosts(filteredPosts);
        setPageInfo({ hasNextPage: false, nextCursor: null }); // 페이지네이션 없음
      } catch (err: any) {
        console.error('Fetch error:', err.message);
        setError(err.message || '게시글을 불러오는데 실패했습니다.');
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    },
    [user?.userId]
  );

  // 초기 데이터 로드
  const loadInitialPosts = useCallback(async () => {
    setPosts([]); // 초기화
    await fetchPosts();
  }, [fetchPosts]);

  // loadMore는 페이지네이션이 없으므로 빈 함수로 유지
  const loadMore = useCallback(async () => {
    console.log('loadMore called, but no pagination available');
  }, []);

  // userId 변경 시 초기 데이터 로드
  useEffect(() => {
    loadInitialPosts();
  }, [loadInitialPosts]);

  return {
    posts,
    isLoading,
    error,
    loadInitialPosts,
    loadMore,
    pageInfo,
  };
};