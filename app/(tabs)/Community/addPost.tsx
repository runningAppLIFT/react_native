import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Text, Image, Modal } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';

export default function WritePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // 모달 상태

  const router = useRouter();

  const handleCancelPost = () => {
    setIsModalVisible(true); // 모달을 표시
  };

  const confirmCancel = () => {
    setIsModalVisible(false); // 모달 닫기
    router.back(); // 뒤로 이동
  };

  const handlePostSubmit = () => {
    console.log('Title:', title);
    console.log('Content:', content);
    console.log('Images:', images);
    router.push('/(tabs)/Community'); // 저장 후 게시판으로 이동
  };

  return (
    <ThemedView style={styles.container}>
      {/* 상단 헤더 영역 */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleCancelPost} style={styles.backButton}>
          <Text style={styles.backButtonText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>자유게시판</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="제목입력"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="내용"
        value={content}
        onChangeText={setContent}
        multiline
      />
      <View style={styles.imageRow}>
        {Array.from({ length: 5 }).map((_, index) => (
          <View key={index} style={styles.imageBox}>
            {images[index] ? (
              <Image source={{ uri: images[index] }} style={styles.image} />
            ) : (
              <TouchableOpacity onPress={() => {/* 이미지 업로드 구현 */}}>
                <Text style={styles.imageAddText}>사진</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.submitButton} onPress={handlePostSubmit}>
        <Text style={styles.submitButtonText}>게시글 작성하기</Text>
      </TouchableOpacity>

      {/* 작성 취소 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)} // Android 전용 뒤로가기 버튼 설정
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>작성 취소</Text>
            <Text style={styles.modalMessage}>작성 중인 내용을 취소하시겠습니까?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)} // 모달 닫기
              >
                <Text style={styles.modalButtonText}>아니오</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmCancel} // 작성 취소 확인
              >
                <Text style={styles.modalButtonText}>예</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  // 헤더 스타일
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  backButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 30,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  textArea: {
    height: 350,
    textAlignVertical: 'top',
    padding: 10,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imageBox: {
    width: 70,
    height: 70,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imageAddText: {
    fontSize: 12,
    color: '#999',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
