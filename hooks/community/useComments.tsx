import { useState, useCallback, useEffect } from 'react';
import Constants from 'expo-constants';

// API URL 설정
const API_URL = Constants.expoConfig?.extra?.apiUrl;

// API 응답에서 오는 댓글 원본 인터페이스
interface CommentApiResponse {
  coment_id: number;
  user_id: number;
  post_id: number;
  coment_detail: string; // API 응답에서는 이름이 coment_detail
  coment_parent: number | null; // API 응답에서는 이름이 coment_parent
  nickname: string; // 사용자 닉네임
  created_at: string;
}

// 프론트엔드에서 사용할 댓글 인터페이스
export interface Comment {
  coment_id: number;
  user_id: number;
  author: string; // user_id를 기반으로 생성
  content: string; // coment_detail에서 변환
  created_at: string;
  replies: Comment[]; // 대댓글 배열
}

// 댓글 생성 요청 본문 인터페이스
export interface CreateCommentRequest {
  user_id: number;
  content: string;
  parent_comment_id?: number | null;
}

// API 응답 인터페이스 (댓글 목록)
interface CommentsApiResponse {
  message: string;
  comments: CommentApiResponse[];
}

// API 응답 인터페이스 (댓글 생성)
interface CreateCommentResponse {
  message: string;
  comment: CommentApiResponse;
}

// API 응답 인터페이스 (댓글 삭제)
interface DeleteCommentResponse {
  message: string;
}

export const usePostComments = (postId: number) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API 응답을 프론트엔드용 댓글 구조로 변환하는 함수
  const transformComments = (apiComments: CommentApiResponse[]): Comment[] => {
    // 부모 댓글과 답글을 구분하여 계층 구조로 변환
    const parentComments: Comment[] = [];
    const replyMap: Record<number, Comment> = {};
    
    // 먼저 모든 댓글을 순회하며 형식 변환
    apiComments.forEach(comment => {
      // API 응답과 컴포넌트에서 사용하는 필드명 맞추기
      const formattedComment: Comment = {
        coment_id: comment.coment_id,
        user_id: comment.user_id,
        author: `${comment.nickname}`, // nickname를 화면에 표시할 author로 변환
        content: comment.coment_detail, // coment_detail을 content로 변환
        created_at: comment.created_at,
        replies: []
      };
      
      // 부모 댓글이 없으면 최상위 댓글
      if (!comment.coment_parent) {
        parentComments.push(formattedComment);
        replyMap[comment.coment_id] = formattedComment;
      } 
      // 부모 댓글이 있으면 답글
      else {
        if (replyMap[comment.coment_parent]) {
          replyMap[comment.coment_parent].replies.push(formattedComment);
        } else {
          // 부모 댓글이 아직 처리되지 않았다면, 임시로 맵에 저장
          // (API 응답 순서가 보장되지 않을 경우를 대비)
          const tempParent: Comment = {
            coment_id: comment.coment_parent,
            user_id: 0, // 임시값
            author: '',
            content: '',
            created_at: '',
            replies: [formattedComment]
          };
          replyMap[comment.coment_parent] = tempParent;
        }
      }
    });
    
    return parentComments;
  };

  // 단일 댓글 API 응답을 프론트엔드용 댓글 객체로 변환
  const transformSingleComment = (apiComment: CommentApiResponse): Comment => {
    return {
      coment_id: apiComment.coment_id,
      user_id: apiComment.user_id,
      author: `사용자 ${apiComment.nickname}`,
      content: apiComment.coment_detail,
      created_at: apiComment.created_at,
      replies: []
    };
  };

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
        throw new Error('댓글을 불러오는 데 실패했습니다.');
      }

      const result: CommentsApiResponse = await response.json();
      console.log('Comments API result:', result); // 디버깅

      // API 응답 데이터를 프론트엔드용 구조로 변환
      const formattedComments = transformComments(result.comments || []);
      setComments(formattedComments);
      setError(null);
    } catch (err: any) {
      console.error('Comments fetch error:', err.message); // 디버깅
      setError(`댓글 불러오기에 실패했습니다: ${err.message}`);
    } finally {
      setIsLoading(false);
      console.log('Comments isLoading set to false'); // 디버깅
    }
  }, [postId]);

  // 댓글 생성
  const createComment = useCallback(async (commentData: CreateCommentRequest) => {
    if (!postId) {
      setError('게시글 ID가 없습니다.');
      throw new Error('Invalid post ID');
    }
  
    setIsLoading(true);
    try {
      const apiRequestData = {
        user_id: commentData.user_id,
        coment_detail: commentData.content,
        coment_parent: commentData.parent_comment_id || null,
      };
  
      console.log('Creating comment:', apiRequestData); // 디버깅
  
      const url = `${API_URL}/communities/posts/${postId}/comments`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiRequestData),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create comment: ${response.status} - ${errorText}`);
      }
  
      const result: CreateCommentResponse = await response.json();
      const newComment = transformSingleComment(result.comment);
  
      setComments((prevComments) => {
        if (commentData.parent_comment_id) {
          const parentExists = prevComments.some(
            (comment) => comment.coment_id === commentData.parent_comment_id
          );
          if (!parentExists) {
            console.warn('부모 댓글이 존재하지 않습니다:', commentData.parent_comment_id);
            return prevComments;
          }
          return prevComments.map((comment) =>
            comment.coment_id === commentData.parent_comment_id
              ? { ...comment, replies: [...comment.replies, newComment] }
              : comment
          );
        }
        return [...prevComments, newComment];
      });
  
      setError(null);
      return newComment;
    } catch (err: any) {
      setError(`댓글 작성에 실패했습니다: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  // 댓글 삭제
  const deleteComment = useCallback(async (commentId: number) => {
    if (!postId || !commentId) {
      setError('게시글 ID 또는 댓글 ID가 없습니다.');
      throw new Error('Invalid post ID or comment ID');
    }

    setIsLoading(true);
    try {
      const url = `${API_URL}/communities/posts/${postId}/comments/${commentId}`;
      console.log('Deleting comment from URL:', url); // 디버깅

      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('Delete comment response status:', response.status); // 디버깅
      if (response.status === 204) {
        // 204 No Content: 응답 본문이 없으므로 JSON 파싱 생략
        console.log('Comment deleted successfully'); // 디버깅
      } else if (!response.ok) {
        const errorText = await response.text();
        console.log('Delete comment error response:', errorText); // 디버깅
        throw new Error('댓글 삭제에 실패했습니다.');
      } else {
        // 다른 성공 상태 코드(예: 200)의 경우 JSON 파싱
        const result: DeleteCommentResponse = await response.json();
        console.log('Delete comment API result:', result); // 디버깅
      }

      // Update local state to remove the deleted comment
      setComments((prevComments) => {
        const removeComment = (comments: Comment[]): Comment[] => {
          return comments
            .filter((comment) => comment.coment_id !== commentId)
            .map((comment) => ({
              ...comment,
              replies: removeComment(comment.replies),
            }));
        };
        return removeComment(prevComments);
      });

      setError(null);
      return { message: 'Comment deleted successfully' };
    } catch (err: any) {
      console.error('Delete comment error:', err.message); // 디버깅
      setError(`댓글 삭제에 실패했습니다: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
      console.log('Delete comment isLoading set to false'); // 디버깅
    }
  }, [postId]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { comments, setComments, isLoading, error, refetch: fetchComments, createComment, deleteComment };
};