import { useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useAuth } from './authContext';

const API_URL = Constants.expoConfig?.extra?.apiUrl;

export const useRunRecorder = () => {
  const { distance, time, pace, path, date } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // 경로 파싱
  let routePath: { longitude: number; latitude: number }[] = [];
  try {
    routePath = JSON.parse(String(path)) || [];
  } catch (error) {
    console.error('경로 파싱 실패:', error);
    routePath = [];
  }

  // 코스 저장
  const handleSaveCourse = () => {
    Alert.alert('저장 완료', '코스가 내 저장 코스에 추가되었습니다.');
  };

  // 기록 저장
  const handleSave = async () => {
    if (!user) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }
  
    const distanceNum = Number(distance);
    try {
      let paceSeconds: number;
      try {
        const [minutes, seconds] = String(pace).split(':').map(Number);
        paceSeconds = minutes * 60 + seconds;
      } catch {
        paceSeconds = 0;
      }
  
      // time 포맷팅
      const formatTime = (time: string): string => {
        const parts = time.split(':');
        if (parts.length === 3) {
          const [hours, minutes, seconds] = parts;
          return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
        } else if (parts.length === 2) {
          const [minutes, seconds] = parts;
          const hours = Math.floor(Number(minutes) / 60);
          const remainingMinutes = Number(minutes) % 60;
          return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}:${seconds.padStart(2, '0')}`;
        } else {
          return '00:00:00';
        }
      };
  
      const formattedTime = formatTime(String(time));
  
      const recordData = {
        user_id: Number(user.userId) || 0,
        run_time: formattedTime,
        run_distance: distanceNum,
        run_course: {
          type: 'LineString',
          coordinates: routePath.map((point: { longitude: number; latitude: number }) => [
            Number(point.longitude) || 0,
            Number(point.latitude) || 0,
          ]),
        },
        run_title: title || null,
        run_content: description || null,
        run_pace: paceSeconds / 60,
      };
  
      console.log('백엔드로 전송:', recordData);
  
      const response = await fetch(`${API_URL}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordData),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          errorData.error ||
          `HTTP ${response.status}: 기록 저장에 실패했습니다.`;
        throw new Error(
          Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        );
      }
  
      const result = await response.json();
      Alert.alert('저장 완료', `기록이 저장되었습니다. (ID: ${result.recordId})`);
      router.push('/(tabs)/Running');
    } catch (error: any) {
      console.error('기록 저장 실패:', error);
      const displayMessage = error.message || '기록 저장 중 문제가 발생했습니다.';
      Alert.alert('오류', displayMessage);
    }
  };

  return {
    routePath,
    date,
    distance,
    pace,
    time,
    title,
    setTitle,
    description,
    setDescription,
    handleSaveCourse,
    handleSave,
  };
};