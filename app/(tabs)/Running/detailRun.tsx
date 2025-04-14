import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity, Alert } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // 아이콘 패키지 (Ionicons 사용)

export default function DetailRunScreen() {
  const { distance, time, pace, path, date } = useLocalSearchParams(); // 전달된 기록 데이터 받기
  const routePath = JSON.parse(String(path)); // String 값을 배열로 변환
  const router = useRouter(); // 라우터 객체 생성

  // 제목과 내용을 저장하는 상태 설정
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // 코스 저장 로직 (이미 존재하는 저장 로직을 호출 가능)
  const handleSaveCourse = () => {
    // 여기에 코스를 저장하는 기존 로직 추가
    Alert.alert('저장 완료', '코스가 내 저장 코스에 추가되었습니다.');
  };

  // 입력값 저장 로직
  const handleSave = () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('오류', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    // 저장 처리 (혹은 서버로 데이터 전송)
    Alert.alert('저장 완료', `제목: ${title}\n내용: ${description}`);

    // 저장 후 `tabs/Running` 경로로 이동
    router.push('/(tabs)/Running');
  };

  return (
    <View style={styles.container}>
      {/* 지도 */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: routePath[0]?.latitude || 37.7749,
          longitude: routePath[0]?.longitude || -122.4194,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Polyline coordinates={routePath} strokeColor="#FF5E2B" strokeWidth={3} />
      </MapView>

      {/* 코스 저장 버튼 */}
      <TouchableOpacity style={styles.saveCourseButton} onPress={handleSaveCourse}>
        <Ionicons name="bookmark-outline" size={24} color="white" />
      </TouchableOpacity>

      {/* 기록 화면 */}
      <View style={styles.infoContainer}>
        <Text style={styles.date}>{date}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>거리</Text>
          <Text style={styles.infoValue}>
            {Number(distance).toFixed(2)} km
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>페이스</Text>
          <Text style={styles.infoValue}>{pace}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>시간</Text>
          <Text style={styles.infoValue}>{time}</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="제목 입력"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="내용 입력"
          multiline
          value={description}
          onChangeText={setDescription}
        />
        {/* 확인 버튼 */}
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>확인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.4,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    flex: 1,
  },
  date: {
    fontSize: 16,
    color: '#888',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  multilineInput: {
    minHeight: 80,
  },
  button: {
    backgroundColor: '#FF5E2B',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveCourseButton: {
    position: 'absolute',
    bottom: Dimensions.get('window').height * 0.5,
    right: 20,
    backgroundColor: '#FF5E2B',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});
