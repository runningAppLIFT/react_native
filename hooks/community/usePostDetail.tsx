import { useState, useCallback, useEffect } from 'react';
import Constants from 'expo-constants';

// API URL 설정
const API_URL = Constants.expoConfig?.extra?.apiUrl;

// 게시글 인터페이스
export interface PostDetail {
  comm_number: number;
  user_id: number;
  comm_title: string;
  comm_detail: string;
  created_at: string;
  is_notice?: boolean; // Optional fields from API response
  modify_at?: string | null;
  status?: string;
}

// API 응답 인터페이스 추가
interface ApiResponse {
  message: string;
  post: PostDetail;
}

export const usePostDetail = (postId: number) => {
  const [post, setPost] = useState<PostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 게시글 가져오기
  const fetchPost = useCallback(async () => {
    if (!postId) {
      setError('게시글 ID가 없습니다.');
      return;
    }

    setIsLoading(true);
    try {
      const url = `${API_URL}/communities/posts/${postId}`;
      console.log('Fetching post from URL:', url); // 디버깅

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('Response status:', response.status); // 디버깅
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText); // 디버깅
        throw new Error(`Failed to load post: ${response.status} - ${errorText}`);
      }

      const result: ApiResponse = await response.json();
      console.log('API result:', result); // 디버깅

      setPost(result.post); // Extract the 'post' field
      setError(null);
    } catch (err: any) {
      console.error('Fetch error:', err.message); // 디버깅
      setError(`게시글 불러오기에 실패했습니다: ${err.message}`);
    } finally {
      setIsLoading(false);
      console.log('isLoading set to false'); // 디버깅
    }
  }, [postId]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return { post, isLoading, error };
};