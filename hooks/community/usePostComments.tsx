import { useState, useCallback, useEffect } from 'react';
import Constants from 'expo-constants';

// API URL 설정
const API_URL = Constants.expoConfig?.extra?.apiUrl;

// 댓글 인터페이스
export interface Comment {
  comment_id: string;
  author: string;
  content: string;
  created_at: string;
  replies: Comment[];
}

// API 응답 인터페이스
interface CommentsApiResponse {
  message: string;
  comments: Comment[];
}

export const usePostComments = (postId: number) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 댓글 가져오기
  const fetchComments = useCallback(async () => {
    if (!postId) {
      setError('게시글 ID가 없습니다.');
      return;
    }

    setIsLoading(true);
    try {
      const url = `${API_URL}/communities/posts/${postId}/comments`;
      console.log('Fetching comments from URL:', url); // 디버깅

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('Comments response status:', response.status); // 디버깅
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Comments error response:', errorText); // 디버깅
        throw new Error(`Failed to load comments: ${response.status} - ${errorText}`);
      }

      const result: CommentsApiResponse = await response.json();
      console.log('Comments API result:', result); // 디버깅

      setComments(result.comments); // Extract the 'comments' field
      setError(null);
    } catch (err: any) {
      console.error('Comments fetch error:', err.message); // 디버깅
      setError(`댓글 불러오기에 실패했습니다: ${err.message}`);
    } finally {
      setIsLoading(false);
      console.log('Comments isLoading set to false'); // 디버깅
    }
  }, [postId]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { comments, isLoading, error, refetch: fetchComments };
};