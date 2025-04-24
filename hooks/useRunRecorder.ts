import { useState, useEffect } from 'react'; // useEffect 추가
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useAuth } from './authContext';

const API_URL = Constants.expoConfig?.extra?.apiUrl;

// 러닝 기록 데이터를 관리하는 커스텀 훅
export const useRunRecorder = () => {
  // FreeRun에서 전달된 파라미터 추출
  const { distance, time, pace, path, date } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  // 상태 관리: 제목, 설명, 경로 데이터
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [routePath, setRoutePath] = useState<{ latitude: number; longitude: number }[]>([]);

  // 경로 데이터 파싱 및 동기화
  // path 파라미터가 변경될 때 routePath를 업데이트
  useEffect(() => {
    let parsedPath: { latitude: number; longitude: number }[] = [];
    if (typeof path === 'string' && path.trim() !== '' && path !== 'undefined') {
      try {
        parsedPath = JSON.parse(path);
        // 배열이고, 각 좌표가 { latitude, longitude } 형식인지 검증
        if (
          !Array.isArray(parsedPath) ||
          !parsedPath.every(
            (coord) =>
              typeof coord === 'object' &&
              'latitude' in coord &&
              'longitude' in coord &&
              !isNaN(coord.latitude) &&
              !isNaN(coord.longitude)
          )
        ) {
          console.warn('Invalid routePath format:', parsedPath);
          parsedPath = [];
        }
      } catch (error) {
        console.error('경로 파싱 실패:', error, 'Input:', path);
        parsedPath = [];
      }
    } else {
      console.log('path is undefined or invalid, setting routePath to empty array');
    }
    setRoutePath(parsedPath);
  }, [path]); // path가 변경될 때마다 실행

  // 코스 저장 함수
  // 러닝 경로를 사용자의 저장된 코스로 추가
  const handleSaveCourse = async () => {
    if (!user) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

    try {
      // API 호출: 백엔드 엔드포인트에 맞게 수정
      const response = await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: Number(user.userId) || 0,
          course_coordinates: routePath.map((point) => [
            Number(point.longitude) || 0,
            Number(point.latitude) || 0,
          ]),
        }),
      });

      if (!response.ok) {
        throw new Error('코스 저장에 실패했습니다.');
      }

      Alert.alert('저장 완료', '코스가 내 저장 코스에 추가되었습니다.');
    } catch (error: any) {
      console.error('코스 저장 실패:', error);
      Alert.alert('오류', error.message || '코스 저장 중 문제가 발생했습니다.');
    }
  };

  // 기록 저장 함수
  // 러닝 기록을 백엔드에 저장하고 홈 화면으로 이동
  const handleSave = async () => {
    if (!user) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

    const distanceNum = Number(distance) || 0;

    try {
      // pace 파싱: MM'SS" 형식을 초 단위로 변환
      let paceSeconds: number;
      try {
        const paceStr = String(pace).replace('"', '');
        const [minutes, seconds] = paceStr.split("'").map(Number);
        paceSeconds = (minutes || 0) * 60 + (seconds || 0);
      } catch {
        console.warn('Invalid pace format:', pace);
        paceSeconds = 0;
      }

      // pace 포맷팅: 초를 MM:SS 형식으로 변환
      const formatPace = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
      };

      // time 포맷팅: FreeRun에서 전달된 MM:SS 또는 HH:MM:SS 형식을 표준화
      const formatTime = (time: string): string => {
        const parts = time.split(':');
        if (parts.length === 3) {
          // HH:MM:SS 형식
          const [hours, minutes, seconds] = parts;
          return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
        } else if (parts.length === 2) {
          // MM:SS 형식
          const [minutes, seconds] = parts;
          const hours = Math.floor(Number(minutes) / 60);
          const remainingMinutes = Number(minutes) % 60;
          return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}:${seconds.padStart(2, '0')}`;
        } else {
          console.warn('Invalid time format:', time);
          return '00:00:00';
        }
      };

      const formattedTime = formatTime(String(time));
      const formattedPace = formatPace(paceSeconds);

      // 백엔드로 전송할 데이터 구성
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
        run_pace: formattedPace,
      };

      console.log('백엔드로 전송:', recordData);

      // API 호출: 러닝 기록 저장
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

  // 훅에서 반환하는 값
  return {
    routePath,
    setRoutePath, // DetailRunScreen에서 경로 데이터를 업데이트하기 위해 제공
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