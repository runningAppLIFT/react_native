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
  is_notice?: boolean;
  modify_at?: string | null;
  status?: string;
}

// API 응답 인터페이스
interface ApiResponse {
  message: string;
  post?: PostDetail;
}

export const usePostDetail = (postId: number) => {
  const [post, setPost] = useState<PostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // 게시글 가져오기
  const fetchPost = useCallback(async () => {
    if (!postId) {
      setError('게시글 ID가 없습니다.');
      return;
    }

    setIsLoading(true);
    try {
      const url = `${API_URL}/communities/posts/${postId}`;
      console.log('Fetching post from URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`Failed to load post: ${response.status} - ${errorText}`);
      }

      const result: ApiResponse = await response.json();
      console.log('API result:', result);

      setPost(result.post || null);
      setError(null);
    } catch (err: any) {
      console.error('Fetch error:', err.message);
      setError(`게시글 불러오기에 실패했습니다: ${err.message}`);
    } finally {
      setIsLoading(false);
      console.log('isLoading set to false');
    }
  }, [postId]);

  // 게시글 수정
  const updatePost = useCallback(async (data: { comm_title: string; comm_detail: string; user_id: number }) => {
    if (!postId) {
      setUpdateError('게시글 ID가 없습니다.');
      return;
    }

    setIsUpdateLoading(true);
    setUpdateError(null);

    try {
      const url = `${API_URL}/communities/posts/${postId}`;
      console.log('Updating post at URL:', url, 'with data:', data);

      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      console.log('Update response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Update error response:', errorText);
        throw new Error(`Failed to update post: ${response.status} - ${errorText}`);
      }

      const result: ApiResponse = await response.json();
      console.log('Update API result:', result);

      await fetchPost(); // 수정 후 최신 데이터 가져오기
      return result;
    } catch (err: any) {
      console.error('Update error:', err.message);
      setUpdateError(`게시글 수정에 실패했습니다: ${err.message}`);
      throw err;
    } finally {
      setIsUpdateLoading(false);
      console.log('isUpdateLoading set to false');
    }
  }, [postId, fetchPost]);

// 게시글 삭제
const deletePost = useCallback(async () => {
  if (!postId) {
    setDeleteError('게시글 ID가 없습니다.');
    throw new Error('Invalid post ID');
  }

  setIsDeleteLoading(true);
  setDeleteError(null);

  try {
    const url = `${API_URL}/communities/posts/${postId}`;
    console.log('Deleting post at URL:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('Delete post response status:', response.status);

    if (response.status === 204) {
      console.log('Post deleted successfully (204)');
    } else if (!response.ok) {
      const errorText = await response.text();
      console.log('Delete post error response:', errorText);
      throw new Error(`게시글 삭제에 실패했습니다: ${errorText}`);
    } else {
      // 다른 성공 상태코드 (예: 200)일 경우 JSON 응답 처리
      const result: { message: string } = await response.json();
      console.log('Delete post API result:', result);
    }

    setPost(null); // 삭제 후 게시글 상태 초기화
    return { message: '게시글이 성공적으로 삭제되었습니다.' };
  } catch (err: any) {
    console.error('Delete post error:', err.message);
    setDeleteError(`게시글 삭제에 실패했습니다: ${err.message}`);
    throw err;
  } finally {
    setIsDeleteLoading(false);
    console.log('isDeleteLoading set to false');
  }
}, [postId]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return {
    post,
    isLoading,
    error,
    fetchPost,
    updatePost,
    isUpdateLoading,
    updateError,
    deletePost,
    isDeleteLoading,
    deleteError,
  };
};