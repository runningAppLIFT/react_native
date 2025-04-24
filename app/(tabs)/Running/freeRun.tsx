import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useMapStore } from '@/stores/mapStore';
import { useLocation } from '../../../hooks/useLocation';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RunModal from '@/components/RunModal';
import * as Location from 'expo-location';

// 좌표 인터페이스 정의
interface Coordinate {
  latitude: number;
  longitude: number;
  timestamp?: number;
}

// 지도 영역 인터페이스 정의
interface Region extends Coordinate {
  latitudeDelta: number;
  longitudeDelta: number;
}

export default function FreeRun() {
  const router = useRouter();
  const { region, setRegion } = useMapStore();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [path, setPath] = useState<Coordinate[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [watchId, setWatchId] = useState<Location.LocationSubscription | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pace, setPace] = useState(0);
  const [currentPace, setCurrentPace] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [distance, setDistance] = useState(0);

  // 위치 권한 확인 및 요청
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('위치 권한 필요', '이 앱은 위치 정보가 필요합니다.');
        router.back();
      }
    };
    requestPermissions();
  }, []);

  // 위치 정보 가져오기 (커스텀 훅 사용)
  useLocation(setRegion);

  // 러닝 시작 함수: 위치 추적 시작, 상태 초기화
  const startRunning = async () => {
    setIsRunning(true);
    setIsPaused(false);
    setPath([]);
    setDistance(0);
    setStartTime(Date.now());
    setElapsedTime(0);
    setShowModal(true);
    setPace(0);
    setCurrentPace(0);
  
    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 2,
        },
        (location) => {
          if (!isPaused && location.coords.accuracy && location.coords.accuracy < 20) {
            const newCoord: Coordinate = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              timestamp: location.timestamp,
            };
            setPath((prev) => {
              const updatedPath = [...prev, newCoord];
              const newDistance = calculateDistance(updatedPath);
              setDistance(newDistance);
  
              // 평균 페이스 계산: 속력(거리/시간)으로 1km 주행 시간(초) 계산
              if (newDistance > 0 && elapsedTime > 0) {
                const speed = newDistance / elapsedTime; // km/s
                const avgPace = (1 / speed) || 0; // 1km를 뛰는 데 걸리는 시간(초)
                setPace(avgPace);
              }
  
              // 현재 페이스 계산: 마지막 두 좌표 기반, 초/km
              if (updatedPath.length >= 2) {
                const lastTwo = updatedPath.slice(-2);
                const segmentDistance = calculateDistance(lastTwo); // km
                const segmentTime = (lastTwo[1].timestamp! - lastTwo[0].timestamp!) / 1000; // 초
                if (segmentDistance > 0 && segmentTime > 0) {
                  const speed = segmentDistance / segmentTime; // km/s
                  const currPace = (1 / speed) || 0; // 1km를 뛰는 데 걸리는 시간(초)
                  setCurrentPace(currPace);
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
      setWatchId(subscription);
    } catch (error) {
      console.error('Location watch error:', error);
      Alert.alert('오류', '위치 추적을 시작할 수 없습니다.');
      setIsRunning(false);
      setShowModal(false);
    }
  };

  // 일시정지/재개 토글 함수: 러닝 상태 전환
  const togglePause = () => {
    if (!isPaused) {
      setElapsedTime(Math.floor((Date.now() - (startTime || 0)) / 1000));
    } else {
      setStartTime(Date.now() - elapsedTime * 1000);
    }
    setIsPaused(!isPaused);
  };

  // 러닝 종료 함수: 위치 추적 종료, 결과 저장 및 화면 이동
  const stopRunning = () => {
    if (watchId !== null) {
      watchId.remove();
      setWatchId(null);
    }
    if (!isPaused) {
      setElapsedTime(Math.floor((Date.now() - (startTime || 0)) / 1000));
    }
    setIsRunning(false);
    setShowModal(false);
  
    const missingData: string[] = [];
    if (distance === 0) missingData.push('거리');
    if (elapsedTime === 0) missingData.push('시간');
    if (path.length === 0) missingData.push('경로');
  
    if (missingData.length > 0) {
      Alert.alert(
        '데이터 누락',
        `다음 데이터가 없습니다: ${missingData.join(', ')}. 러닝을 시작해주세요`,
        [{ text: '확인', style: 'cancel' }]
      );
      setPath([]);
      setDistance(0);
      setElapsedTime(0);
      setStartTime(null);
      setPace(0);
      setCurrentPace(0);
      setIsLocked(false);
      return;
    }
  
    const formattedDistance = distance.toFixed(2);
    const formattedTime = formatTime(elapsedTime);
    const avgPace = pace > 0 ? `${Math.floor(pace / 60)}'${(Math.round(pace % 60)).toString().padStart(2, '0')}"` : "0'00\"";
    const date = new Date().toLocaleString();
  
    router.push({
      pathname: '/(tabs)/Running/detailRun',
      params: {
        distance: formattedDistance,
        time: formattedTime,
        pace: avgPace,
        path: JSON.stringify(path),
        date: date,
      },
    });
  
    setPath([]);
    setDistance(0);
    setElapsedTime(0);
    setStartTime(null);
    setPace(0);
    setCurrentPace(0);
    setIsLocked(false);
  };

  // 잠금 상태 토글 함수: 버튼 비활성화/활성화
  const toggleLock = () => {
    setIsLocked((prev) => !prev);
  };

  // 경과 시간 업데이트: 러닝 중 1초마다 시간 갱신
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && startTime && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime, isPaused]);

  // 시간 포맷팅 함수: 초를 HH:MM:SS 또는 MM:SS 형식으로 변환
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0
      ? `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 거리 계산 함수: 하버사인 공식을 사용해 좌표 간 거리 계산 (단위: km)
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
      {/* 지도 뷰: 사용자 위치와 경로 표시 */}
      <MapView
        style={styles.map}
        showsUserLocation
        followsUserLocation={isRunning}
        region={region || undefined}
        onRegionChangeComplete={(newRegion: Region) =>
          !isRunning && setRegion(newRegion)
        }
      >
        {path.length > 1 && (
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
        distance={distance}
        pace={pace}
        currentPace={currentPace}
        toggleLock={toggleLock}
        isPaused={isPaused}
        stopRunning={stopRunning}
        isLocked={isLocked}
      />

      {/* 러닝 제어 버튼: 시작/일시정지/재개 */}
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