import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useMapStore } from '@/stores/mapStore';
import { useLocation } from '../../hooks/useLocation';

// 타입 정의: 좌표와 지도 영역에 대한 인터페이스
interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Region extends Coordinate {
  latitudeDelta: number;
  longitudeDelta: number;
}

export default function RunScreen() {
  const { region, setRegion } = useMapStore(); // Zustand 스토어에서 지도 영역 상태와 설정 함수 가져오기
  const [isRunning, setIsRunning] = useState(false); // 달리기 진행 상태 관리
  const [isPaused, setIsPaused] = useState(false); // 일시 정지 상태 관리
  const [path, setPath] = useState<Coordinate[]>([]); // 이동 경로를 저장하는 배열
  const [startTime, setStartTime] = useState<number | null>(null); // 달리기 시작 시간 (밀리초)
  const [elapsedTime, setElapsedTime] = useState(0); // 경과 시간 (초 단위)
  const [watchId, setWatchId] = useState<number | null>(null); // 위치 추적 작업의 ID

  // 현재 위치를 가져와 지도 영역을 초기화
  useLocation(setRegion);

  // 달리기 시작 함수
  const startRunning = async () => {
    setIsRunning(true);
    setIsPaused(false);
    setPath([]);
    setStartTime(Date.now());
    setElapsedTime(0);
  
    const { Location } = require('expo-location');
    const id = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 400,
        distanceInterval: 1,
      },
      (location) => {
        // isPaused 상태일 때는 아무 작업도 하지 않음
        if (!isPaused) {
          const newCoord: Coordinate = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setPath((prev) => [...prev, newCoord]);
          setRegion({
            latitude: newCoord.latitude,
            longitude: newCoord.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
        }
      }
    );
    setWatchId(id);
  };

  // 일시 정지/재개 함수
  const togglePause = () => {
    if (!isPaused) {
      // 일시정지 시작 시 현재까지의 경과 시간을 저장
      setElapsedTime(Math.floor((Date.now() - (startTime || 0)) / 1000));
    } else {
      // 일시정지 해제 시 새로운 시작 시간 설정
      setStartTime(Date.now() - elapsedTime * 1000);
    }
    setIsPaused(!isPaused);
  };

// 달리기 종료 함수
const stopRunning = () => {
  if (watchId !== null) {
    const { Location } = require('expo-location');
    Location.stopLocationUpdatesAsync(watchId);
    setWatchId(null);
  }
  if (!isPaused) {
    // 종료 시 최종 경과 시간 계산
    setElapsedTime(Math.floor((Date.now() - (startTime || 0)) / 1000));
  }
  setIsRunning(false);
  alert(`달리기 종료!\n시간: ${formatTime(elapsedTime)}\n거리: ${calculateDistance(path).toFixed(2)} km`);
  
  // 초기화: 경로와 경과 시간 리셋
  setPath([]);           // 경로 초기화
  setElapsedTime(0);     // 경과 시간 초기화
  setStartTime(null);    // 시작 시간 초기화 (선택적)
};

  // 경과 시간 계산을 위한 useEffect 수정
useEffect(() => {
  let interval: NodeJS.Timeout;
  if (isRunning && startTime && !isPaused) {
    interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
  }
  return () => {
    if (interval) {
      clearInterval(interval);
    }
  };
}, [isRunning, startTime, isPaused]);


  // 시간 포맷팅 함수: 초를 MM:SS 형식으로 변환
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 이동 거리 계산 함수: Haversine 공식 사용
  const calculateDistance = (coords: Coordinate[]) => {
    if (coords.length < 2) return 0; // 좌표가 2개 미만이면 0 반환
    let totalDistance = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const lat1 = coords[i].latitude * (Math.PI / 180); // 라디안으로 변환
      const lon1 = coords[i].longitude * (Math.PI / 180);
      const lat2 = coords[i + 1].latitude * (Math.PI / 180);
      const lon2 = coords[i + 1].longitude * (Math.PI / 180);

      const dLat = lat2 - lat1;
      const dLon = lon2 - lon1;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.asin(Math.sqrt(a));
      totalDistance += c * 6371; // 지구 반지름(6371km)을 곱해 거리 계산
    }
    return totalDistance;
  };

  return (
    <View style={styles.container}>
      {/* 지도 컴포넌트 */}
      <MapView
        style={styles.map}
        showsUserLocation // 현재 위치 표시
        region={region || undefined} // 초기 지도 영역 설정
        onRegionChangeComplete={(newRegion: Region) => !isRunning && setRegion(newRegion)} // 달리기 중이 아닐 때만 수동 이동 허용
      >
        {path.length > 0 && (
          <Polyline
            coordinates={path} // 이동 경로를 선으로 표시
            strokeColor="#FF0000" // 빨간색 선
            strokeWidth={3} // 선 두께
          />
        )}
        {region && !isRunning && (
          <Marker
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            title="현재 위치" // 달리기 중이 아닐 때 현재 위치 마커 표시
          />
        )}
      </MapView>

      {/* 달리기 정보 및 버튼 오버레이 */}
      <View style={styles.buttonWrapper}>
      <View style={styles.overlay}>
  <Text style={styles.timerText}>
    시간: {formatTime(elapsedTime)} | 거리: {calculateDistance(path).toFixed(2)} km
  </Text>
</View>
  {/* 일시정지 버튼 */}
  {isRunning && !isPaused && (
    <TouchableOpacity style={styles.button} onPress={togglePause}>
      <Text style={styles.buttonText}>일시정지</Text>
    </TouchableOpacity>
  )}

  {/* 다시 시작 버튼 */}
  {isRunning && isPaused && (
    <TouchableOpacity style={styles.button} onPress={togglePause}>
      <Text style={styles.buttonText}>다시 시작</Text>
    </TouchableOpacity>
  )}

  {/* 종료 버튼 */}
  {isRunning && (
    <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={stopRunning}>
      <Text style={styles.buttonText}>종료</Text>
    </TouchableOpacity>
  )}

  {/* 시작 버튼 */}
  {!isRunning && (
    <TouchableOpacity style={styles.button} onPress={startRunning}>
      <Text style={styles.buttonText}>시작</Text>
    </TouchableOpacity>
  )}
</View>
    </View>
  );
}

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', // 전체 배경색
  },
  map: {
    flex: 1,
    width: Dimensions.get('window').width, // 지도 크기를 화면 너비에 맞춤
  },
  overlay: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 18,
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // 반투명 검정 배경
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonWrapper: {
    flexDirection: 'column', // 버튼을 세로로 배치
    alignItems: 'center', // 가운데 정렬
    justifyContent: 'center',
    position: 'absolute', // 버튼을 중첩하지 않도록 고정 위치
    bottom: 100, // 화면 하단에서 100px 위에 배치
    width: '100%',
  },
  button: {
    backgroundColor: '#FF5E2BFF', // 밝은 색상 (주황)
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginBottom: 10, // 버튼 간 간격 추가
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
