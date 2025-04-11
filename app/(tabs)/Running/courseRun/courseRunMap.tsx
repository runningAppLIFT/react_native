import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useMapStore } from '@/stores/mapStore';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RunModal from '@/components/RunModal';
import { useLocation } from '@/hooks/useLocation';

// 좌표 인터페이스 정의
interface Coordinate {
  latitude: number;
  longitude: number;
}

// 지도 영역 인터페이스 정의
interface Region extends Coordinate {
  latitudeDelta: number;
  longitudeDelta: number;
}

export default function FreeRun() {
  const router = useRouter();
  const { region, setRegion } = useMapStore();
  const [isRunning, setIsRunning] = useState(false); // 달리기 상태
  const [isPaused, setIsPaused] = useState(false); // 일시정지 상태
  const [path, setPath] = useState<Coordinate[]>([]); // 이동 경로
  const [startTime, setStartTime] = useState<number | null>(null); // 시작 시간
  const [elapsedTime, setElapsedTime] = useState(0); // 경과 시간
  const [watchId, setWatchId] = useState<number | null>(null); // 위치 추적 ID
  const [showModal, setShowModal] = useState(false); // 모달 표시 여부
  const [pace, setPace] = useState(0); // 평균 페이스
  const [currentPace, setCurrentPace] = useState(0); // 현재 페이스
  const [isLocked, setIsLocked] = useState(false); // 잠금 상태

  // 위치 정보 가져오기
  useLocation(setRegion);

  // 달리기 시작 함수
  const startRunning = async () => {
    setIsRunning(true);
    setIsPaused(false);
    setPath([]);
    setStartTime(Date.now());
    setElapsedTime(0);
    setShowModal(true);

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
          setPath((prev) => {
            const updatedPath = [...prev, newCoord];
            const distance = calculateDistance(updatedPath);
            if (distance > 0) {
              const avgPace = (elapsedTime / distance) * 1000;
              setPace(Math.floor(avgPace));
            }
            if (updatedPath.length >= 2) {
              const lastTwo = updatedPath.slice(-2);
              const segmentDistance = calculateDistance(lastTwo);
              const segmentTime = 400 / 1000;
              if (segmentDistance > 0) {
                const currPace = (segmentTime / segmentDistance) * 1000;
                setCurrentPace(Math.floor(currPace));
              }
            }
            return updatedPath;
          });
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

  // 일시정지/재개 토글 함수
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
    setShowModal(false);
    alert(
      `달리기 종료!\n시간: ${formatTime(elapsedTime)}\n거리: ${calculateDistance(
        path
      ).toFixed(2)} km`
    );

    setPath([]);
    setElapsedTime(0);
    setStartTime(null);
    setPace(0);
    setCurrentPace(0);
    setIsLocked(false);
  };

  // 잠금 상태 토글 함수
  const toggleLock = () => {
    setIsLocked((prev) => !prev);
  };

  // 경과 시간 업데이트
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

  // 시간 포맷팅 함수
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 거리 계산 함수
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
      {/* 지도 표시 */}
      <MapView
        style={styles.map}
        showsUserLocation
        region={region || undefined}
        onRegionChangeComplete={(newRegion: Region) =>
          !isRunning && setRegion(newRegion)
        }
      >
        {path.length > 0 && (
          <Polyline coordinates={path} strokeColor="#FF0000" strokeWidth={3} />
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

      {/* 뒤로 가기 버튼 */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        disabled={isLocked}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* 러닝 정보 모달 */}
      <RunModal
        visible={showModal}
        elapsedTime={elapsedTime}
        distance={calculateDistance(path)}
        pace={pace}
        currentPace={currentPace}
        toggleLock={toggleLock}
        isPaused={isPaused} // 일시정지 상태 전달
        stopRunning={stopRunning} // 종료 함수 전달
      />

      {/* 버튼 그룹 (종료 버튼 제거) */}
      <View style={[styles.buttonWrapper, { zIndex: 1000 }]}>
        {isRunning && !isPaused && (
          <TouchableOpacity
            style={styles.button}
            onPress={togglePause}
            disabled={isLocked}
          >
            <Text style={styles.buttonText}>일시정지</Text>
          </TouchableOpacity>
        )}

        {isRunning && isPaused && (
          <TouchableOpacity
            style={styles.button}
            onPress={togglePause}
            disabled={isLocked}
          >
            <Text style={styles.buttonText}>다시 시작</Text>
          </TouchableOpacity>
        )}

        {!isRunning && (
          <TouchableOpacity
            style={styles.button}
            onPress={startRunning}
            disabled={isLocked}
          >
            <Text style={styles.buttonText}>시작</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 15,
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
    zIndex: 1000,
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