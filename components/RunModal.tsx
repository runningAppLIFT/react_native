import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// RunModal 컴포넌트의 props 인터페이스 정의
interface RunModalProps {
  visible: boolean; // 모달 표시 여부
  elapsedTime: number; // 달린 시간 (초 단위)
  distance: number; // 달린 거리 (km)
  pace: number; // 평균 페이스 (초/km)
  currentPace: number; // 현재 페이스 (초/km)
  toggleLock: () => void; // 화면 잠금/해제 토글 함수
  isPaused: boolean; // 러닝 일시정지 여부
  stopRunning: () => void; // 러닝 종료 함수
  isLocked: boolean; // 화면 잠금 상태
}

// 시간 포맷팅 함수: 초 단위를 HH:MM:SS 또는 MM:SS 형식으로 변환
const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return hours > 0
    ? `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 페이스 포맷팅 함수: 초/km를 MM'SS" 형식으로 변환
const formatPace = (seconds: number) => {
  if (seconds <= 0 || !isFinite(seconds)) return "0'00\""; // 비정상 값 처리
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}'${secs.toString().padStart(2, '0')}"`;
};

// RunModal 컴포넌트: 러닝 중 실시간 정보(거리, 시간, 페이스 등)를 표시
const RunModal: React.FC<RunModalProps> = ({
  visible, // 모달 표시 여부
  elapsedTime, // FreeRun에서 전달된 달린 시간 (초)
  distance, // FreeRun에서 전달된 달린 거리 (km)
  pace, // FreeRun에서 전달된 평균 페이스 (초/km)
  currentPace, // FreeRun에서 전달된 현재 페이스 (초/km)
  toggleLock, // 잠금 상태 토글 함수
  isPaused, // 러닝 일시정지 상태
  stopRunning, // 러닝 종료 함수
  isLocked, // 화면 잠금 상태
}) => {
  // 긴 눌림 시작 시간 상태: 잠금 토글을 위한 타이머
  const [pressStartTime, setPressStartTime] = useState<number | null>(null);

  // 긴 눌림 처리: 2초 이상 눌렀을 때 잠금 상태 토글
  const handleLongPress = () => {
    toggleLock(); // FreeRun의 isLocked 상태 업데이트
  };

  // 눌림 시작: 긴 눌림 타이머 시작
  const handlePressIn = () => {
    setPressStartTime(Date.now());
  };

  // 눌림 종료: 타이머 초기화
  const handlePressOut = () => {
    setPressStartTime(null);
  };

  // 모달이 보이지 않으면 렌더링하지 않음
  if (!visible) return null;

  return (
    // 모달 컨테이너: 화면 상단에 위치, 터치 이벤트 제한
    <View style={styles.modalContainer} pointerEvents="box-none">
      {/* 모달 콘텐츠: 러닝 정보 표시 */}
      <View style={styles.modalContent}>
        {/* 헤더: 앱 이름과 잠금 아이콘 */}
        <View style={styles.header}>
          <Text style={styles.headerText}>LIFT</Text>
          {/* 잠금/해제 버튼: 2초 긴 눌림으로 동작 */}
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onLongPress={handleLongPress}
            delayLongPress={2000}
          >
            <Ionicons
              name={isLocked ? 'lock-closed' : 'lock-open'}
              size={24}
              color="#FF5E2B"
            />
          </Pressable>
        </View>
        {/* 잠금 상태에 따라 터치 비활성화 */}
        <View pointerEvents={isLocked ? 'none' : 'auto'}>
          {/* 러닝 통계: 거리, 평균 페이스, 시간 표시 */}
          <View style={styles.statsRow}>
            {/* 거리 표시 */}
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>거리</Text>
              <Text style={styles.statValue}>{distance.toFixed(2)} km</Text>
            </View>
            {/* 평균 페이스 표시 */}
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>페이스</Text>
              <Text style={styles.statValue}>{formatPace(pace)}</Text>
            </View>
            {/* 달린 시간 표시 */}
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>시간</Text>
              <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
            </View>
          </View>
          {/* 하단 섹션: 일시정지 시 종료 버튼, 아니면 현재 페이스 표시 */}
          <View style={styles.currentPace}>
            {isPaused ? (
              // 일시정지 상태: 운동 종료 버튼 표시
              <View style={styles.stopButtonContainer}>
                <Pressable
                  style={[styles.stopButton, { opacity: isLocked ? 0.5 : 1 }]}
                  onLongPress={stopRunning}
                  delayLongPress={1000} // 1초 긴 눌림으로 종료
                  disabled={isLocked}
                >
                  <Text style={styles.stopButtonText}>운동 종료</Text>
                </Pressable>
                <Text style={styles.stopButtonHint}>꾹 눌러 운동 마치기</Text>
              </View>
            ) : (
              // 러닝 중: 현재 페이스 표시
              <>
                <Text style={styles.currentPaceLabel}>현재 페이스</Text>
                <Text style={styles.currentPaceValue}>{formatPace(currentPace)}</Text>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 500, // 모달이 다른 UI 위에 표시되도록
  },
  modalContent: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // 안드로이드 그림자 효과
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  currentPace: {
    alignItems: 'center',
  },
  currentPaceLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  currentPaceValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  stopButtonContainer: {
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    opacity: 1, // 잠금 상태 시 투명도 조정
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stopButtonHint: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 5,
  },
});

export default RunModal;