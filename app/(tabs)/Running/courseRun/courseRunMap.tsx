import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useMapStore } from '@/stores/mapStore';
import { useLocation } from '../../../../hooks/useLocation';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// 타입 정의: 좌표와 지도 영역에 대한 인터페이스
interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Region extends Coordinate {
  latitudeDelta: number;
  longitudeDelta: number;
}

export default function FreeRun() {
  const router = useRouter(); // 내비게이션용 라우터
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
      setElapsedTime(Math.floor((Date.now() - (startTime || 0)) / 1000));
    } else {
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
      setElapsedTime(Math.floor((Date.now() - (startTime || 0)) / 1000));
    }
    setIsRunning(false);
    alert(
      `달리기 종료!\n시간: ${formatTime(elapsedTime)}\n거리: ${calculateDistance(
        path
      ).toFixed(2)} km`
    );

    // 초기화: 경로와 경과 시간 리셋
    setPath([]);
    setElapsedTime(0);
    setStartTime(null);
  };

  // 경과 시간 계산을 위한 useEffect
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
    if (coords.length < 2) return 0;
    let totalDistance = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const lat1 = coords[i].latitude * (Math.PI / 180);
      const lon1 = coords[i].longitude * (Math.PI / 180);
      const lat2 = coords[i + 1].latitude * (Math.PI / 180);
      const lon2 = coords[i + 1].longitude * (Math.PI / 180);

      const dLat = lat2 - lat1;
      const dLon = lon2 - lon1;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.asin(Math.sqrt(a));
      totalDistance += c * 6371;
    }
    return totalDistance;
  };

  return (
    <View style={styles.container}>
      {/* 지도 컴포넌트 */}
      <MapView
        style={styles.map}
        showsUserLocation
        region={region || undefined}
        onRegionChangeComplete={(newRegion: Region) =>
          !isRunning && setRegion(newRegion)
        }
      >
        {path.length > 0 && (
          <Polyline
            coordinates={path}
            strokeColor="#FF0000"
            strokeWidth={3}
          />
        )}
        {region && !isRunning && (
          <Marker
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            title="현재 위치"
          />
        )}
      </MapView>

      {/* "이전" 버튼 */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

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
    backgroundColor: 'white',
  },
  map: {
    ...StyleSheet.absoluteFillObject, // 지도를 전체 화면으로 채움
  },
  backButton: {
    position: 'absolute',
    top: 40, // 상단에서 40px 아래
    left: 15, // 왼쪽에서 15px
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 10, // 지도 위에 표시되도록
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 100,
    width: '100%',
  },
  button: {
    backgroundColor: '#FF5E2B',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});