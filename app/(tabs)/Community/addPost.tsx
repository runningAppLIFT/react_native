import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePostCreate } from '@/hooks/community/usePostCreate';
import { usePostDetail } from '@/hooks/community/usePostDetail';
import { useAuth } from '@/hooks/authContext';

export default function WritePost() {
  const { postId } = useLocalSearchParams<{ postId?: string }>();
  const isEdit = !!postId;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  const { createPost, isLoading: isCreateLoading, error: createError } = usePostCreate();
  const {
    post,
    fetchPost,
    updatePost,
    isUpdateLoading,
    updateError,
  } = usePostDetail(Number(postId));

  useEffect(() => {
    if (isEdit && post) {
      setTitle(post.comm_title);
      setContent(post.comm_detail);
    }
  }, [isEdit, post]);

  const handleCancelPost = () => {
    setIsModalVisible(true);
  };

  const confirmCancel = () => {
    setIsModalVisible(false);
    router.back();
  };

  const handlePostSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('오류', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    const postData = {
      user_id: user?.userId,
      comm_title: title,
      comm_detail: content,
    };

    try {
      if (isEdit) {
        await updatePost(postData);
        Alert.alert('성공', '게시글이 수정되었습니다.', [
          { text: '확인', onPress: () => router.push('/(tabs)/Community') },
        ]);
      } else {
        await createPost(postData);
        Alert.alert('성공', '게시글이 작성되었습니다.', [
          { text: '확인', onPress: () => router.push('/(tabs)/Community') },
        ]);
      }

      setTitle('');
      setContent('');
      setImages([]);
    } catch (err) {
      Alert.alert('오류', createError || updateError || '게시글 저장에 실패했습니다.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ThemedView style={styles.container}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={handleCancelPost} style={styles.backButton}>
              <Text style={styles.backButtonText}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{isEdit ? '게시글 수정' : '자유게시판'}</Text>
          </View>

          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
                    <TouchableOpacity onPress={() => {/* TODO: Implement image upload */}}>
                      <Text style={styles.imageAddText}>사진</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.submitButton, (isCreateLoading || isUpdateLoading) && styles.disabledButton]}
              onPress={handlePostSubmit}
              disabled={isCreateLoading || isUpdateLoading}
            >
              {(isCreateLoading || isUpdateLoading) ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEdit ? '게시글 수정하기' : '게시글 작성하기'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>

          <Modal
            animationType="slide"
            transparent
            visible={isModalVisible}
            onRequestClose={() => setIsModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>작성 취소</Text>
                <Text style={styles.modalMessage}>작성 중인 내용을 취소하시겠습니까?</Text>
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setIsModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>아니오</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={confirmCancel}
                  >
                    <Text style={styles.modalButtonText}>예</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ThemedView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
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
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
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
