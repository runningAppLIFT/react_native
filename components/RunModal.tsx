import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RunModalProps {
  visible: boolean;
  elapsedTime: number; // 초 단위
  distance: number; // km
  pace: number; // 평균 페이스 (초/km, 1km 주행 시간)
  currentPace: number; // 현재 페이스 (초/km, 1km 주행 시간)
  toggleLock: () => void;
  isPaused: boolean;
  stopRunning: () => void;
  isLocked: boolean;
}

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return hours > 0
    ? `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatPace = (seconds: number) => {
  if (seconds <= 0 || !isFinite(seconds)) return "0'00\"";
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
  isLocked,
}) => {
  const [pressStartTime, setPressStartTime] = useState<number | null>(null);

  const handleLongPress = () => {
    toggleLock();
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
        <View pointerEvents={isLocked ? 'none' : 'auto'}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>거리</Text>
              <Text style={styles.statValue}>{distance.toFixed(2)} km</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>평균 페이스</Text>
              <Text style={styles.statValue}>{formatPace(pace)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>시간</Text>
              <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
            </View>
          </View>
          <View style={styles.currentPace}>
            {isPaused ? (
              <View style={styles.stopButtonContainer}>
                <Pressable
                  style={[styles.stopButton, { opacity: isLocked ? 0.5 : 1 }]}
                  onLongPress={stopRunning}
                  delayLongPress={1000}
                  disabled={isLocked}
                >
                  <Text style={styles.stopButtonText}>운동 종료</Text>
                </Pressable>
                <Text style={styles.stopButtonHint}>꾹 눌러 운동 마치기</Text>
              </View>
            ) : (
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