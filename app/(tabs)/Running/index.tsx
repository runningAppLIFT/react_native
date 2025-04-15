import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { PanGestureHandler } from 'react-native-gesture-handler';

export default function RunningIndex() {
  const router = useRouter();

  const handleNavigation = (mode: string) => {
    const targetPath = mode === 'freeRun' ? '/(tabs)/Running/freeRun' : '/(tabs)/Running/courseRun';
    router.push(targetPath);
  };

  // 디버깅용 PanGestureHandler (기본 제스처 실패 시 사용)

  const onGestureEvent = ({ nativeEvent }) => {
    if (nativeEvent.translationX < -150) {
      router.push('(tabs)/Running/RunningHistory');
    }
  };


  return (
    <PanGestureHandler onGestureEvent={onGestureEvent}>
      <View style={styles.container}>
        <Text style={styles.title}>
          원하시는 달리기{'\n'}모드를 선택해주세요
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleNavigation('freeRun')}
        >
          <Text style={styles.buttonText}>자유 달리기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleNavigation('courseRun')}
        >
          <Text style={styles.buttonText}>코스 불러오기</Text>
        </TouchableOpacity>
        <Text style={styles.swipeHint}>오른쪽으로 스와이프하여 기록 보기</Text>
      </View>
   </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5EDFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#555',
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  swipeHint: {
    fontSize: 14,
    color: '#777',
    marginTop: 20,
  },
});