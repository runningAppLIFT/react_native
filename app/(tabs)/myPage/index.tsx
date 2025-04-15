import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

export default function MyPageIndex() {
  const router = useRouter();
  const translateX = useSharedValue(0);

  const onGestureEvent = ({ nativeEvent }) => {
    translateX.value = nativeEvent.translationX; // 스와이프 중 애니메이션
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

        {/* 사용자 정보 */}
        <Text style={styles.userInfo}>아이디 : 혀니</Text>
        <Text style={styles.userInfo}>가입일자 : 2025.1.24</Text>
        <Text style={styles.userInfo}>소개글 : 러닝에 진심인 취준생</Text>

        {/* 버튼들을 화면 중앙 아래쪽으로 배치 */}
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
    marginTop: 20, // 상단 마진
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
    width: 140, // 컨테이너 넓이
    height: 140, // 컨테이너 높이
  },
  avatarPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80, // 크기에 맞춰 원형 유지
    backgroundColor: '#E6EFFF',
  },
  userInfo: {
    fontSize: 16,
    color: '#333',
    marginVertical: 5,
  },

  // 버튼 컨테이너 (아래로 이동)
  buttonContainer: {
    position: 'absolute', // 고정된 위치
    bottom: 120, // 하단 탭에서 약간 위로 띄움 (필요시 조정)
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
