import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/authContext';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl;

export default function MyPageIndex() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const translateX = useSharedValue(0);
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onGestureEvent = ({ nativeEvent }) => {
    translateX.value = nativeEvent.translationX;
  };

  const onHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      if (nativeEvent.translationX > 100) {
        router.push('(tabs)/myPage/left');
      } else if (nativeEvent.translationX < -100) {
        router.push('(tabs)/myPage/right');
      }
      translateX.value = withTiming(0);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).replace(/\. /g, '.')
    : '정보 없음';

  const handleSaveNickname = async () => {
    if (!user) {
      Alert.alert('오류', '사용자 정보가 없습니다.');
      return;
    }

    if (!nickname.trim()) {
      Alert.alert('오류', '닉네임을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('닉네임 업데이트 요청:', { userId: user.userId, nickname });
      const response = await fetch(`${API_URL}/auth/users/${user.userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user || { ...user, nickname });
        setNickname(data.user?.nickname || nickname);
        setIsEditing(false);
        Alert.alert('성공', '닉네임이 변경되었습니다.');
      } else {
        const errorData = await response.json();
        Alert.alert('오류', errorData.message || '닉네임 변경에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      activeOffsetX={[-10, 10]}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        <Text style={styles.header}>LIFT</Text>

        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder} />
        </View>

        <View style={styles.nicknameContainer}>
          <Text style={styles.userInfoLabel}>아이디:</Text>
          {isEditing ? (
            <TextInput
              style={styles.nicknameInput}
              value={nickname}
              onChangeText={setNickname}
              autoFocus
              editable={!isLoading}
            />
          ) : (
            <Text style={styles.userInfo}>{nickname || '정보 없음'}</Text>
          )}
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={() => {
              if (isEditing) {
                handleSaveNickname();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>{isEditing ? '저장' : '수정'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.userInfoDateContainer}>
          <Text style={styles.userInfoDateLabel}>가입일자:</Text>
          <Text style={styles.userInfoDateText}>{joinDate || '정보 없음'}</Text>
        </View>

        <View style={styles.kakaoIdContainer}>
          <Text style={styles.kakaoIdLabel}>카카오 ID:</Text>
          <Text style={styles.kakaoIdText}>{user?.kakao_id || '정보 없음'}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#A3BFFA' }]}>
            <Text style={styles.buttonText}>회원 탈퇴하기</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A3BFFA',
    alignSelf: 'flex-start',
    marginBottom: 50,
    marginLeft: 10,
  },
  avatarContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 140,
  },
  avatarPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#E6EFFF',
  },
  nicknameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginVertical: 5,
  },
  userInfoLabel: {
    fontSize: 16,
    color: '#333',
    width: 80,
  },
  userInfo: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  nicknameInput: {
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#A3BFFA',
    flex: 1,
    paddingVertical: 2,
  },
  saveButton: {
    backgroundColor: '#A3BFFA',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#B0C4DE',
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  userInfoDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginVertical: 5,
  },
  userInfoDateLabel: {
    fontSize: 16,
    color: '#333',
    width: 80,
  },
  userInfoDateText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  kakaoIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginVertical: 5,
  },
  kakaoIdLabel: {
    fontSize: 16,
    color: '#333',
    width: 80,
  },
  kakaoIdText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 120,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#C7D2FE',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});