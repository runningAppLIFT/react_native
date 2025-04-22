import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePostDetail } from '@/hooks/community/usePostDetail';
import { usePostComments, Comment } from '@/hooks/community/useComments';
import { useAuth } from '@/hooks/authContext';
import { usePosts } from '@/hooks/community/usePosts';

export default function PostDetail() {
  const router = useRouter();
  const { post } = useLocalSearchParams();
  let postId: number | null = null;

  // postId 파싱 및 유효성 검사
  try {
    if (typeof post === 'string') {
      const parsed = JSON.parse(post);
      postId = Number(parsed.comm_number) || null;
    }
  } catch (err) {
    console.error('post 파싱 에러:', err);
  }

  const { user } = useAuth();
  const { post: postData, isLoading: isPostLoading, error: postError, deletePost } = usePostDetail(postId);
  const { loadInitialPosts } = usePosts();
  const {
    comments,
    setComments,
    isLoading: isCommentsLoading,
    error: commentsError,
    refetch,
    createComment,
    deleteComment,
  } = usePostComments(postId);

  const [modalVisible, setModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [postDeleteModalVisible, setPostDeleteModalVisible] = useState(false);

  // 디버깅 로그
  console.log('Post ID:', postId);
  console.log('Post Data:', postData);
  console.log('Comments:', comments);

  const handleEdit = () => {
    if (user && postData && postData.user_id === user.userId) {
      router.push({
        pathname: '/(tabs)/Community/addPost',
        params: { postId: String(postId) },
      });
    } else {
      Alert.alert('권한 없음', '이 게시글을 수정할 수 있는 권한이 없습니다.');
    }
    setModalVisible(false);
  };

  const handleDelete = () => {
    console.log('Deleting post:', postData);
    setPostDeleteModalVisible(true);
    setModalVisible(false);
  };

  const handleConfirmDeletePost = async () => {
    try {
      await deletePost();
      setPostDeleteModalVisible(false);
      await loadInitialPosts();
      Alert.alert('성공', '게시글이 삭제되었습니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error('게시글 삭제 에러:', err);
      Alert.alert('오류', '게시글 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    if (!user) {
      Alert.alert('로그인 필요', '댓글을 작성하려면 로그인이 필요합니다.', [
        { text: '취소', style: 'cancel' },
        { text: '로그인', onPress: () => router.push('/(tabs)/login') },
      ]);
      return;
    }

    try {
      const commentData = {
        user_id: user.userId,
        content: commentText,
        parent_comment_id: replyingTo?.coment_id || null,
      };
      console.log('댓글 전송 데이터:', commentData);

      await createComment(commentData);

      setCommentText('');
      setReplyingTo(null);
      refetch();
      Alert.alert('성공', '댓글이 작성되었습니다.');
    } catch (err) {
      console.error('댓글 작성 에러:', err);
      Alert.alert('오류', commentsError || '댓글 작성에 실패했습니다.');
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) {
      setDeleteModalVisible(false);
      return;
    }

    try {
      await deleteComment(commentToDelete);
      setDeleteModalVisible(false);
      setCommentToDelete(null);
      await refetch();
      Alert.alert('성공', '댓글이 삭제되었습니다.');
    } catch (err) {
      console.error('댓글 삭제 에러:', err);
      Alert.alert('오류', '댓글 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // postId 유효성 검사
  if (!postId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.statusText}>유효하지 않은 게시글 ID입니다.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>뒤로 가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 로딩 상태
  if (isPostLoading || isCommentsLoading || !postData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066FF" />
          <Text style={styles.statusText}>데이터를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 에러 상태
  if (postError || commentsError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.statusText}>
            {postError || commentsError || '데이터를 불러올 수 없습니다.'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>뒤로 가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerText}>자유게시판</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          <View style={styles.postHeader}>
            <Text style={styles.author}>
              {postData.nickname ? postData.nickname : `사용자 ${postData.user_id}`}
            </Text>
            <Text style={styles.date}>
              {postData.created_at
                ? new Date(postData.created_at).toLocaleString('ko-KR', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '날짜 없음'}
            </Text>
          </View>
          <Text style={styles.postTitle}>{postData.comm_title || '제목 없음'}</Text>
          <View style={styles.postBody}>
            <Text style={styles.postContent}>{postData.comm_detail || '내용 없음'}</Text>
          </View>

          {/* 댓글 영역 */}
          <View style={styles.commentsSection}>
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>댓글</Text>
              <Text style={styles.likes}>💬 {(comments || []).length}</Text>
            </View>
            {(comments || []).map((comment) => (
              <View key={comment.coment_id} style={styles.commentBox}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>
                    {comment.author || comment.nickname || `사용자 ${comment.user_id}`}
                  </Text>
                  {user && user.userId === comment.user_id && (
                    <TouchableOpacity
                      onPress={() => {
                        setCommentToDelete(comment.coment_id);
                        setDeleteModalVisible(true);
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.commentDate}>
                  {comment.created_at
                    ? new Date(comment.created_at).toLocaleString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })
                    : '날짜 없음'}
                </Text>
                <Text style={styles.commentContent}>{comment.content || '내용 없음'}</Text>
                <TouchableOpacity
                  style={styles.replyButton}
                  onPress={() => {
                    console.log('답글 대상 댓글:', comment);
                    setReplyingTo(comment);
                  }}
                >
                  <Text style={styles.replyButtonText}>답글</Text>
                </TouchableOpacity>

                {(comment.replies || []).map((reply) => (
                  <View key={reply.coment_id} style={styles.replyBox}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>
                        {reply.author || reply.nickname || `사용자 ${reply.user_id}`}
                      </Text>
                      {user && user.userId === reply.user_id && (
                        <TouchableOpacity
                          onPress={() => {
                            setCommentToDelete(reply.coment_id);
                            setDeleteModalVisible(true);
                          }}
                        >
                          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={styles.commentDate}>
                      {reply.created_at
                        ? new Date(reply.created_at).toLocaleString('ko-KR', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })
                        : '날짜 없음'}
                    </Text>
                    <Text style={styles.commentContent}>{reply.content || '내용 없음'}</Text>
                  </View>
                ))}
              </View>
            ))}
            {!comments?.length && (
              <Text style={{ color: '#777', marginTop: 8 }}>댓글이 없습니다.</Text>
            )}
          </View>
        </ScrollView>

        {/* 댓글 입력 영역 */}
        <View style={styles.commentInputContainer}>
          {replyingTo && (
            <View style={styles.replyingTo}>
              <Text style={styles.replyingToText}>
                {(replyingTo.author || replyingTo.nickname || `사용자 ${replyingTo.user_id}`)}에게 답글
              </Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Ionicons name="close" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.commentInput}
              placeholder={replyingTo ? '답글을 입력하세요...' : '댓글을 입력하세요...'}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!commentText.trim() || isCommentsLoading) && styles.disabledButton,
              ]}
              onPress={handleCommentSubmit}
              disabled={!commentText.trim() || isCommentsLoading}
            >
              {isCommentsLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>등록</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Post Action Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalButton} onPress={handleEdit}>
              <Text style={styles.modalText}>게시글 수정</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleDelete}>
              <Text style={styles.modalText}>게시글 삭제</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { borderBottomWidth: 0 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Comment Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>댓글을 삭제하시겠습니까?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setCommentToDelete(null);
                }}
              >
                <Text style={styles.modalText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteComment}
              >
                <Text style={[styles.modalText, { color: '#FF3B30' }]}>삭제</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Post Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={postDeleteModalVisible}
        onRequestClose={() => setPostDeleteModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>게시글을 삭제하시겠습니까?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setPostDeleteModalVisible(false)}
              >
                <Text style={styles.modalText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleConfirmDeletePost}
              >
                <Text style={[styles.modalText, { color: '#FF3B30' }]}>삭제</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#0066FF',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  author: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  postBody: {
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  commentsSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  likes: {
    fontSize: 14,
    color: '#rgba(0,0,0,0.5)',
    fontWeight: 'bold',
  },
  commentBox: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  replyBox: {
    paddingVertical: 8,
    paddingLeft: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#F7F8FA',
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  commentContent: {
    fontSize: 14,
    color: '#444',
  },
  replyButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  replyButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  commentInputContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingBottom: Platform.OS === 'ios' ? 70 : 20,
  },
  replyingTo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyingToText: {
    fontSize: 14,
    color: '#666',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 10,
    minHeight: 40,
    maxHeight: 100,
    marginRight: 8,
    backgroundColor: '#F7F8FA',
  },
  submitButton: {
    backgroundColor: '#0066FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    borderBottomWidth: 0,
    marginRight: 10,
  },
  deleteButton: {
    flex: 1,
    alignItems: 'center',
    borderBottomWidth: 0,
  },
  modalText: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0066FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});