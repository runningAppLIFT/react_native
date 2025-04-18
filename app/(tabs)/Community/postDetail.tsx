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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePostDetail } from '@/hooks/community/usePostDetail';
import { usePostComments } from '@/hooks/community/usePostComments';

export default function PostDetail() {
  const router = useRouter();
  const { post } = useLocalSearchParams();
  const postId = typeof post === 'string' ? Number(JSON.parse(post).comm_number) : null;

  const { post: postData, isLoading: isPostLoading, error: postError } = usePostDetail(postId);
  const { comments, isLoading: isCommentsLoading, error: commentsError, refetch } = usePostComments(postId);

  const [modalVisible, setModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const handleEdit = () => {
    console.log('Editing post:', postData);
    setModalVisible(false);
  };

  const handleDelete = () => {
    console.log('Deleting post:', postData);
    setModalVisible(false);
  };

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;

    const newComment = {
      comment_id: Date.now().toString(),
      author: '현재 사용자', // 실제 앱에서는 로그인한 사용자 정보 사용
      content: commentText,
      created_at: new Date().toISOString(),
      replies: [],
    };

    if (replyingTo) {
      // Update the replies array for the specific comment
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.comment_id === replyingTo.comment_id
            ? { ...comment, replies: [...comment.replies, newComment] }
            : comment
        )
      );
      setReplyingTo(null);
    } else {
      // Add new comment to the comments array
      setComments((prevComments) => [...prevComments, newComment]);
    }

    setCommentText('');
    // TODO: POST request to submit comment to API and refetch comments
    // refetch();
  };

  if (isPostLoading || isCommentsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066FF" />
          <Text style={styles.statusText}>데이터를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (postError || !postData || commentsError) {
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
            <Text style={styles.author}>사용자 {postData.user_id}</Text>
            <Text style={styles.date}>
              {new Date(postData.created_at).toLocaleString('ko-KR', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <Text style={styles.postTitle}>{postData.comm_title}</Text>
          <View style={styles.postBody}>
            <Text style={styles.postContent}>{postData.comm_detail}</Text>
          </View>

          {/* 댓글 영역 */}
          <View style={styles.commentsSection}>
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>댓글</Text>
              <Text style={styles.likes}>💬 {comments.length}</Text>
            </View>
            {comments.map((comment) => (
              <View key={comment.comment_id} style={styles.commentBox}>
                <Text style={styles.commentAuthor}>{comment.author}</Text>
                <Text style={styles.commentDate}>
                  {new Date(comment.created_at).toLocaleString('ko-KR', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
                <Text style={styles.commentContent}>{comment.content}</Text>
                <TouchableOpacity
                  style={styles.replyButton}
                  onPress={() => setReplyingTo(comment)}
                >
                  <Text style={styles.replyButtonText}>답글</Text>
                </TouchableOpacity>
                {/* 대댓글 렌더링 */}
                {comment.replies.map((reply) => (
                  <View key={reply.comment_id} style={styles.replyBox}>
                    <Text style={styles.commentAuthor}>{reply.author}</Text>
                    <Text style={styles.commentDate}>
                      {new Date(reply.created_at).toLocaleString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </Text>
                    <Text style={styles.commentContent}>{reply.content}</Text>
                  </View>
                ))}
              </View>
            ))}
            {!comments.length && (
              <Text style={{ color: '#777', marginTop: 8 }}>
                댓글이 없습니다.
              </Text>
            )}
          </View>
        </ScrollView>

        {/* 댓글 입력 영역 */}
        <View style={styles.commentInputContainer}>
          {replyingTo && (
            <View style={styles.replyingTo}>
              <Text style={styles.replyingToText}>
                {replyingTo.author}에게 답글
              </Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Ionicons name="close" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.commentInput}
              placeholder={
                replyingTo ? '답글을 입력하세요...' : '댓글을 입력하세요...'
              }
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                !commentText.trim() && styles.disabledButton,
              ]}
              onPress={handleCommentSubmit}
              disabled={!commentText.trim()}
            >
              <Text style={styles.submitButtonText}>등록</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Modal */}
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
    </SafeAreaView>
  );
}

// Styles remain unchanged
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
  modalButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalText: {
    fontSize: 16,
    color: '#007AFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0066FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});