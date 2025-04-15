import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/authContext'; // 프로젝트 구조에 맞게 경로 조정

export default function MyPageIndex() {
  const router = useRouter();
  const { user } = useAuth(); // AuthContext에서 user 가져오기
  const translateX = useSharedValue(0);

  const onGestureEvent = ({ nativeEvent }) => {
    translateX.value = nativeEvent.translationX; // 스와이프 애니메이션
  };

  const onHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      if (nativeEvent.translationX > 100) {
        router.push('(tabs)/myPage/left');
      } else if (nativeEvent.translationX < -100) {
        router.push('(tabs)/myPage/right');
      }
      translateX.value = withTiming(0); // 원래 위치로 복귀
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // 가입일자 포맷팅 (user.createdAt이 "2025-01-24T00:00:00Z" 같은 형식이라고 가정)
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).replace(/\. /g, '.')
    : '정보 없음';

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      activeOffsetX={[-10, 10]}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* 상단 타이틀 */}
        <Text style={styles.header}>LIFT</Text>

        {/* 프로필 이미지 (원형 아바타) */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder} />
        </View>

        {/* 사용자 정보: 닉네임과 가입일자만 표시 */}
        <Text style={styles.userInfo}>닉네임: {user?.nickname || '정보 없음'}</Text>
        <Text style={styles.userInfo}>가입일자: {joinDate}</Text>

        {/* 버튼들 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>정보 수정하기</Text>
          </TouchableOpacity>
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
  userInfo: {
    fontSize: 16,
    color: '#333',
    marginVertical: 5,
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