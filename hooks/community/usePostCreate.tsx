import { useState, useCallback } from 'react';
import Constants from 'expo-constants';

// API URL 설정
const API_URL = Constants.expoConfig?.extra?.apiUrl;

// 게시글 생성 요청 본문 인터페이스
export interface CreatePostRequest {
  user_id: number;
  comm_title: string;
  comm_detail: string;
}

// API 응답 인터페이스 (예상 구조)
interface CreatePostResponse {
  message: string;
  post?: {
    comm_number: number;
    user_id: number;
    comm_title: string;
    comm_detail: string;
    created_at: string;
  };
}

export const usePostCreate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPost = useCallback(async (postData: CreatePostRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = `${API_URL}/communities/posts`;
      console.log('Creating post at URL:', url, 'Data:', postData); // 디버깅

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      console.log('Response status:', response.status); // 디버깅
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText); // 디버깅
        throw new Error(`Failed to create post: ${response.status} - ${errorText}`);
      }

      const result: CreatePostResponse = await response.json();
      console.log('API result:', result); // 디버깅

      return result; // Return the response for further handling
    } catch (err: any) {
      console.error('Create post error:', err.message); // 디버깅
      setError(`게시글 작성에 실패했습니다: ${err.message}`);
      throw err; // Re-throw to allow caller to handle
    } finally {
      setIsLoading(false);
      console.log('isLoading set to false'); // 디버깅
    }
  }, []);

  return { createPost, isLoading, error };
};