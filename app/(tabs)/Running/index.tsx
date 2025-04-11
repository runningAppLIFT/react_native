import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function RunningIndex() {
  const router = useRouter();

  const handleNavigation = (mode: string) => {
    const targetPath = mode === 'freeRun' ? '/(tabs)/Running/freeRun' : '/(tabs)/Running/courseRun';
    console.log(`Navigating to: ${targetPath}`);
    router.push(targetPath); // 직접 대상 페이지로 이동
  };

  return (
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
    </View>
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
});