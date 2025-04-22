import React, { useEffect} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/authContext';



export default function LoginScreen() {
  const { user, signInWithKakao, error } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithKakao();
    } catch (err) {
      Alert.alert('로그인 실패', '카카오 로그인이 실패했습니다.');
    }
  };

  useEffect(() => {
    if (user) {
      Alert.alert('로그인 성공', `${user.nickname} 어서오라냥!`);
      router.replace('/(tabs)');
    }
  }, [user, router]);;

  return (
    <View style={styles.container}>
      {/* 상단 영역: 고양이 이미지와 제목 */}
      <View style={styles.header}>
      <Image
        source={require('../../assets/images/welcomecat.jpg')} // 로컬 경로 추가
        style={styles.catImage}
      />
        <Text style={styles.title}>LIFT</Text>
        <Text style={styles.content}>
        (Learning, Inspired, Friend, Together){"\n"}{"\n"}
        "서로 배우며 영감을 나누고,
          {"\n"}
          친구가 되어 함께 성장하자"
          {"\n"}
        </Text>
      </View>

      {/* 카카오 로그인 버튼 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={signInWithKakao} style={styles.button}>
          <Text style={styles.buttonText}>카카오 회원가입/로그인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    justifyContent: 'center', // 중앙 정렬
    // marginBottom: 80,
    paddingBottom: 80,
  },
  header: {
    alignItems: 'center', // 고양이 이미지와 텍스트 중앙 정렬
    marginTop: 60, // 상단 간격
  },
  catImage: {
    width: 150,
    height: 150,
    marginBottom: 20, // 고양이와 텍스트 간격
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10, // 제목과 설명 간격
  },
  content: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 24, // 가독성을 위한 줄 간격 설정
  },
  buttonContainer: {
    alignItems: 'center', // 버튼을 중앙 정렬
    marginBottom: 60, // 하단 간격
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: '#FEE500',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6, // Android 그림자 효과
  },
  buttonText: {
    color: '#3C1E1E',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
