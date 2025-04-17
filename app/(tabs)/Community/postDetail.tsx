import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PostDetail() {
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
        author: '피자추',
        content: '커피보다는 이온음료나 물 드셔보세요!',
        date: '03.29 오후 3:43',
      },
      {
        author: '감사합니다',
        content: '정말 꿀팁 감사합니다!',
        date: '03.29 오후 4:12',
      },
      {
        author: '마라톤러',
        content: '저는 물+소금 조금씩 섞어서 마십니다!',
        date: '03.29 오후 4:22',
      },
    ],
  };
  

  const [modalVisible, setModalVisible] = useState(false);

  const handleEdit = () => {
    console.log('Editing post:', parsedPost);
    setModalVisible(false);
  };

  const handleDelete = () => {
    console.log('Deleting post:', parsedPost);
    setModalVisible(false);
  };

  if (!parsedPost) {
    return (
      <View style={styles.container}>
        <Text>게시글 데이터를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
          {/* 댓글 타이틀과 좋아요 */}
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>댓글</Text>
            <Text style={styles.likes}>
              💬{parsedPost.comments?.length || 0}
            </Text>
          </View>
          {/* <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>댓글</Text>
              <Text style={styles.likes}>
                <Ionicons name="chatbubble-outline" size={16} color="#000" /> {parsedPost.comments?.length || 0}
              </Text>
            </View> */}
          {(parsedPost.comments || []).map((comment, index) => (
            <View key={index} style={styles.commentBox}>
              <Text style={styles.commentAuthor}>{comment.author}</Text>
              <Text style={styles.commentDate}>{comment.date}</Text>
              <Text style={styles.commentContent}>{comment.content}</Text>
            </View>
          ))}
          {!parsedPost.comments?.length && (
            <Text style={{ color: '#777', marginTop: 8 }}>댓글이 없습니다.</Text>
          )}
        </View>
      </ScrollView>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between', // 댓글과 좋아요를 양쪽 끝으로 배치
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
