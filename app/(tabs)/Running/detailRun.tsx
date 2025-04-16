import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity, Alert } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useRunRecorder } from '@/hooks/useRunRecorder';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl;

export default function DetailRunScreen() {
  const { record } = useLocalSearchParams();
  const parsedRecord = record ? JSON.parse(record) : null;
  console.log('Received parsedRecord:', parsedRecord);
  console.log('run_course.coordinates:', parsedRecord?.run_course?.coordinates);
  const { routePath, date, distance, pace, time, title, setTitle, description, setDescription, handleSaveCourse, handleSave } = useRunRecorder();

  // 모드 결정: record가 있으면 상세 조회, 없으면 러닝 종료 후
  const isHistoryMode = !!parsedRecord;
  const [isEditing, setIsEditing] = useState(!isHistoryMode); // 러닝 종료 후는 편집 가능, 상세 조회는 기본적으로 읽기 전용

  // 데이터 소스 설정
  const runData = isHistoryMode
    ? {
        date: parsedRecord.created_at,
        distance: parsedRecord.run_distance,
        time: parsedRecord.run_time,
        pace: parsedRecord.run_pace,
        title: parsedRecord.run_title,
        description: parsedRecord.run_content,
        coordinates: parsedRecord.run_course?.coordinates?.map(([longitude, latitude]) => ({
          latitude,
          longitude,
        })) || [],
      }
    : {
        date: Array.isArray(date) ? date[0] : date || '',
        distance: Array.isArray(distance) ? distance[0] : distance || '0',
        time: Array.isArray(time) ? time[0] : time || '',
        pace: Array.isArray(pace) ? pace[0] : pace || '',
        title: title || '',
        description: description || '',
        coordinates: routePath || [],
      };

  // 상태 관리
  const [localTitle, setLocalTitle] = useState(runData.title);
  const [localDescription, setLocalDescription] = useState(runData.description);

  useEffect(() => {
    if (!isHistoryMode) {
      setTitle(localTitle);
      setDescription(localDescription);
    }
  }, [localTitle, localDescription, isHistoryMode, setTitle, setDescription]);

  // 데이터 포맷팅 함수
  const formatRunTime = (runTime) => {
    if (isHistoryMode) {
      const { hours = 0, minutes = 0, seconds = 0 } = runTime || {};
      let timeStr = '';
      if (hours > 0) timeStr += `${hours}시간 `;
      if (minutes > 0) timeStr += `${minutes}분 `;
      if (seconds > 0 || timeStr === '') timeStr += `${seconds}초`;
      return timeStr.trim();
    }
    return runTime;
  };

  const formatPace = (pace) => {
    if (isHistoryMode) {
      const { hours = 0, minutes = 0 } = pace || {};
      let paceStr = '';
      if (hours > 0) paceStr += `${hours}:`;
      paceStr += `${minutes.toString().padStart(2, '0')}/km`;
      return paceStr;
    }
    return pace;
  };

  const formatDate = (dateStr) => {
    if (isHistoryMode) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
    return dateStr;
  };

  // 지도 초기 영역 설정
  const initialRegion = runData.coordinates.length > 0
    ? {
        latitude: runData.coordinates[0].latitude,
        longitude: runData.coordinates[0].longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

  // 저장 핸들러
  const handleSaveAction = async () => {
    if (isHistoryMode) {
      if (isEditing) {
        try {
          const response = await fetch(`${API_URL}/runs/${parsedRecord.record_number}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              run_title: localTitle,
              run_content: localDescription,
            }),
          });
          if (!response.ok) throw new Error('Failed to update record');
          Alert.alert('성공', '기록이 업데이트되었습니다.');
          setIsEditing(false);
        } catch (error) {
          console.error('Error updating record:', error);
          Alert.alert('오류', '기록을 업데이트하지 못했습니다.');
        }
      } else {
        setIsEditing(true); // 편집 모드로 전환
      }
    } else {
      handleSave(); // 러닝 종료 후 저장
    }
  };

  // 경로 저장 (러닝 종료 후에만 사용)
  const handleSaveCourseAction = () => {
    if (!isHistoryMode) {
      handleSaveCourse();
    }
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {runData.coordinates.length > 0 && (
          <Polyline coordinates={runData.coordinates} strokeColor="#FF5E2B" strokeWidth={3} />
        )}
      </MapView>

      {!isHistoryMode && (
        <TouchableOpacity style={styles.saveCourseButton} onPress={handleSaveCourseAction}>
          <Ionicons name="bookmark-outline" size={24} color="white" />
        </TouchableOpacity>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.date}>{formatDate(runData.date)}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>거리</Text>
          <Text style={styles.infoValue}>{Number(runData.distance).toFixed(2)} km</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>페이스</Text>
          <Text style={styles.infoValue}>{formatPace(runData.pace)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>시간</Text>
          <Text style={styles.infoValue}>{formatRunTime(runData.time)}</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="제목 입력"
          value={localTitle}
          onChangeText={setLocalTitle}
          editable={isEditing}
        />
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="내용 입력"
          multiline
          value={localDescription}
          onChangeText={setLocalDescription}
          editable={isEditing}
        />
        <TouchableOpacity style={styles.button} onPress={handleSaveAction}>
          <Text style={styles.buttonText}>{isHistoryMode && !isEditing ? '편집' : '확인'}</Text>
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