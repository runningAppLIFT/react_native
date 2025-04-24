import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RunModalProps {
  visible: boolean;
  elapsedTime: number;
  distance: number;
  pace: number;
  currentPace: number;
  toggleLock: () => void;
  isPaused: boolean;
  stopRunning: () => void;
  isLocked: boolean;
}

// 시간 포맷팅 함수 (HH:MM:SS 형식으로 확장)
const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return hours > 0
    ? `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 페이스 포맷팅 함수 (초/km → MM'SS" 형식)
const formatPace = (seconds: number) => {
  if (seconds <= 0) return "0'00\""; // 유효하지 않은 페이스 처리
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}'${secs.toString().padStart(2, '0')}"`;
};

const RunModal: React.FC<RunModalProps> = ({
  visible,
  elapsedTime,
  distance,
  pace,
  currentPace,
  toggleLock,
  isPaused,
  stopRunning,
  isLocked, // prop으로 받음
}) => {
  const [pressStartTime, setPressStartTime] = useState<number | null>(null);

  const handleLongPress = () => {
    toggleLock(); // FreeRun의 isLocked 상태만 업데이트
  };

  const handlePressIn = () => {
    setPressStartTime(Date.now());
  };

  const handlePressOut = () => {
    setPressStartTime(null);
  };

  if (!visible) return null;

  return (
    <View style={styles.modalContainer} pointerEvents="box-none">
      <View style={styles.modalContent}>
        {/* 헤더: 앱 이름과 잠금 아이콘 */}
        <View style={styles.header}>
          <Text style={styles.headerText}>LIFT</Text>
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
          {/* 거리, 페이스, 시간 표시 */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>거리</Text>
              <Text style={styles.statValue}>{distance.toFixed(2)} km</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>페이스</Text>
              <Text style={styles.statValue}>{formatPace(pace)}</Text> {/* 페이스 형식 변경 */}
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>시간</Text>
              <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text> {/* 시간 형식 확장 */}
            </View>
          </View>
          {/* 현재 페이스 또는 종료 버튼 표시 */}
          <View style={styles.currentPace}>
            {isPaused ? (
              <View style={styles.stopButtonContainer}>
                <Pressable
                  style={styles.stopButton}
                  onLongPress={stopRunning}
                  delayLongPress={1000} // 1초 이상 눌러야 동작
                  disabled={isLocked}
                >
                  <Text style={styles.stopButtonText}>운동 종료</Text>
                </Pressable>
                <Text style={styles.stopButtonHint}>꾹 눌러 운동 마치기</Text>
              </View>
            ) : (
              <>
                <Text style={styles.currentPaceLabel}>현재 페이스</Text>
                <Text style={styles.currentPaceValue}>{formatPace(currentPace)}</Text> {/* 페이스 형식 변경 */}
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 500,
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
    elevation: 5,
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