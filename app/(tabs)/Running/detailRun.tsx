import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity, Alert } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useRunRecorder } from '@/hooks/useRunRecorder';
import Constants from 'expo-constants';
import * as Location from 'expo-location';

const API_URL = Constants.expoConfig?.extra?.apiUrl;

interface RunData {
  date: string;
  distance: string;
  time: string;
  pace: string;
  title: string;
  description: string;
  coordinates: { latitude: number; longitude: number }[];
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

export default function DetailRunScreen() {
  // 개별 파라미터 추출
  const { distance, time, pace, path, date, record } = useLocalSearchParams();

  // record 파싱 (히스토리 모드용)
  let parsedRecord = null;
  if (record) {
    try {
      parsedRecord = JSON.parse(record as string);
    } catch (error) {
      console.error('Error parsing record:', error);
      Alert.alert('오류', '러닝 기록 데이터를 불러오지 못했습니다.');
    }
  }

  const { routePath, setRoutePath, title, setTitle, description, setDescription, handleSaveCourse, handleSave } = useRunRecorder();

  const isHistoryMode = !!parsedRecord;
  const [isEditing, setIsEditing] = useState(!isHistoryMode);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [localTitle, setLocalTitle] = useState(title || '');
  const [localDescription, setLocalDescription] = useState(description || '');

  // path 파싱
  const parsedPath = path
    ? (() => {
        try {
          const parsed = JSON.parse(path as string);
          if (!Array.isArray(parsed)) throw new Error('Path is not an array');
          return parsed;
        } catch (error) {
          console.error('Error parsing path:', error);
          return [];
        }
      })()
    : routePath || [];

  // routePath 동기화
  useEffect(() => {
    if (path && parsedPath.length > 0) {
      setRoutePath(parsedPath);
    }
  }, [path, parsedPath, setRoutePath]);

  // 현재 위치 가져오기
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission denied');
        Alert.alert('오류', '위치 권한이 필요합니다.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  // runData 구성
  const runData: RunData = isHistoryMode
    ? {
        date: parsedRecord?.created_at || '',
        distance: parsedRecord?.run_distance || '0',
        time: parsedRecord?.run_time || '0',
        pace: parsedRecord?.run_pace || '0',
        title: parsedRecord?.run_title || '',
        description: parsedRecord?.run_content || '',
        coordinates: parsedRecord?.run_course?.coordinates || [],
      }
    : {
        date: (date as string) || new Date().toLocaleString(),
        distance: (distance as string) || '0',
        time: (time as string) || '00:00',
        pace: (pace as string) || "0'00\"",
        title: localTitle || '',
        description: localDescription || '',
        coordinates: parsedPath || [],
      };

  // 좌표가 없으면 경고
  useEffect(() => {
    if (runData.coordinates.length === 0) {
      console.warn('No valid coordinates found for the run.');
      Alert.alert('경고', '러닝 경로 데이터가 없습니다.');
    }
  }, [runData.coordinates]);

  // useRunRecorder 상태 동기화
  useEffect(() => {
    if (!isHistoryMode) {
      setTitle(localTitle);
      setDescription(localDescription);
    }
  }, [localTitle, localDescription, isHistoryMode, setTitle, setDescription]);

  // 페이스 포맷팅
  const formatPace = (pace: string) => {
    return pace; // FreeRun에서 이미 MM'SS" 형식으로 전달됨
  };

  // 시간 포맷팅
  const formatRunTime = (runTime: string) => {
    return runTime; // FreeRun에서 이미 MM:SS 또는 HH:MM:SS 형식으로 전달됨
  };

  // 날짜 포맷팅
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // 초기 지도 영역 계산
  const calculateInitialRegion = (coordinates: { latitude: number; longitude: number }[], userLoc: UserLocation | null) => {
    if (coordinates?.length > 0) {
      const latitudes = coordinates.map((coord) => coord.latitude);
      const longitudes = coordinates.map((coord) => coord.longitude);
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      const latitude = (minLat + maxLat) / 2;
      const longitude = (minLng + maxLng) / 2;
      const latitudeDelta = (maxLat - minLat) * 1.5 || 0.01;
      const longitudeDelta = (maxLng - minLng) * 1.5 || 0.01;

      return { latitude, longitude, latitudeDelta, longitudeDelta };
    }

    return {
      latitude: userLoc?.latitude || 37.7749,
      longitude: userLoc?.longitude || -122.4194,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  };

  const initialRegion = calculateInitialRegion(runData.coordinates, userLocation);

  // 저장 처리
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
        router.replace('/(tabs)/Running/RunningHistory');
      }
    } else {
      handleSave();
    }
  };

  // 코스 저장 처리
  const handleSaveCourseAction = () => {
    if (!isHistoryMode) {
      handleSaveCourse();
    }
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion} showsUserLocation={true}>
        {runData.coordinates.length > 0 && (
          <Polyline coordinates={runData.coordinates} strokeColor="#FF5E2B" strokeWidth={3} />
        )}
        {userLocation && (
          <Marker coordinate={userLocation} title="현재 위치" pinColor="blue" />
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
          <Text style={styles.buttonText}>{isHistoryMode && !isEditing ? '확인' : '확인'}</Text>
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