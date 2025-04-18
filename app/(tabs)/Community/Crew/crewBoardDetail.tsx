import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView, TextInput, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CrewBoardDetail() {
  const router = useRouter();
  const { post } = useLocalSearchParams();

  // 더미 데이터: 댓글 리스트를 포함하는 게시글 데이터
  const parsedPost = {
    title: '러닝할 때 수분섭취 어떻게들 하시나요?',
    name: '러닝광',
    time: '3',
    content: '러닝 후 저는 커피를 마시곤 하는데요. 마셔도 갈증 해소가 잘 안되는 것 같아요. 다들 러닝 후에 어떤 거 마시세요??',
    like: 12,
    comment: 3,
    comments: [
      {
        id: '1',
        author: '피자추',
        content: '커피보다는 이온음료나 물 드셔보세요!',
        date: '03.29 오후 3:43',
        replies: [],
      },
      {
        id: '2',
        author: '감사합니다',
        content: '정말 꿀팁 감사합니다!',
        date: '03.29 오후 4:12',
        replies: [],
      },
      {
        id: '3',
        author: '마라톤러',
        content: '저는 물+소금 조금씩 섞어서 마십니다!',
        date: '03.29 오후 4:22',
        replies: [],
      },
    ],
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [comments, setComments] = useState(parsedPost.comments);

  const handleEdit = () => {
    console.log('Editing post:', parsedPost);
    setModalVisible(false);
  };

  const handleDelete = () => {
    console.log('Deleting post:', parsedPost);
    setModalVisible(false);
  };

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      author: '현재 사용자', // 실제 앱에서는 로그인한 사용자 정보 사용
      content: commentText,
      date: new Date().toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      replies: [],
    };

    if (replyingTo) {
      setComments(comments.map(comment => {
        if (comment.id === replyingTo.id) {
          return { ...comment, replies: [...comment.replies, newComment] };
        }
        return comment;
      }));
      setReplyingTo(null);
    } else {
      setComments([...comments, newComment]);
    }

    setCommentText('');
  };

  if (!parsedPost) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>게시글 데이터를 불러올 수 없습니다.</Text>
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
            <Text style={styles.author}>{parsedPost.name}</Text>
            <Text style={styles.date}>{`${parsedPost.time}시간 전`}</Text>
          </View>
          <Text style={styles.postTitle}>{parsedPost.title}</Text>
          <View style={styles.postBody}>
            <Text style={styles.postContent}>{parsedPost.content}</Text>
          </View>

          {/* 댓글 영역 */}
          <View style={styles.commentsSection}>
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>댓글</Text>
              <Text style={styles.likes}>💬{comments.length}</Text>
            </View>
            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentBox}>
                <Text style={styles.commentAuthor}>{comment.author}</Text>
                <Text style={styles.commentDate}>{comment.date}</Text>
                <Text style={styles.commentContent}>{comment.content}</Text>
                <TouchableOpacity
                  style={styles.replyButton}
                  onPress={() => setReplyingTo(comment)}
                >
                  <Text style={styles.replyButtonText}>답글</Text>
                </TouchableOpacity>
                {/* 대댓글 렌더링 */}
                {comment.replies.map((reply, index) => (
                  <View key={index} style={styles.replyBox}>
                    <Text style={styles.commentAuthor}>{reply.author}</Text>
                    <Text style={styles.commentDate}>{reply.date}</Text>
                    <Text style={styles.commentContent}>{reply.content}</Text>
                  </View>
                ))}
              </View>
            ))}
            {!comments.length && (
              <Text style={{ color: '#777', marginTop: 8 }}>댓글이 없습니다.</Text>
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
              placeholder={replyingTo ? '답글을 입력하세요...' : '댓글을 입력하세요...'}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              style={[styles.submitButton, !commentText.trim() && styles.disabledButton]}
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
    marginBottom: 20, // Add some bottom margin for better spacing
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
    paddingBottom: Platform.OS === 'ios' ? 70 : 20, // Extra padding for Android to account for tab bar
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
});