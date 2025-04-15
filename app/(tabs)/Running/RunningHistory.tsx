import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useAuth } from '@/hooks/authContext';

const API_URL = Constants.expoConfig?.extra?.apiUrl;

export default function RunningHistory() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const user_id = user?.userId;

  useEffect(() => {
    if (!user_id) {
      console.warn('User ID is not available');
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/users/${user_id}/runs`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setHistory(Array.isArray(data.records) ? data.records : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('오류', '러닝 기록을 불러오지 못했습니다. 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user_id]);

  const onGestureEvent = ({ nativeEvent }) => {
    if (nativeEvent.translationX > 150) {
      router.back();
    }
  };

  const formatRunTime = (runTime) => {
    const { hours = 0, minutes = 0, seconds = 0 } = runTime || {};
    let timeStr = '';
    if (hours > 0) timeStr += `${hours}시간 `;
    if (minutes > 0) timeStr += `${minutes}분 `;
    if (seconds > 0 || timeStr === '') timeStr += `${seconds}초`;
    return timeStr.trim();
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() =>
        router.push({
          pathname: '/(tabs)/Running/detailRun',
          params: { record: JSON.stringify(item) },
        })
      }
    >
      <Text style={styles.historyText}>날짜: {formatDate(item.created_at)}</Text>
      <Text style={styles.historyText}>거리: {item.run_distance}km</Text>
      <Text style={styles.historyText}>시간: {formatRunTime(item.run_time)}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>러닝 기록</Text>
        <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent}>
      <View style={styles.container}>
        <Text style={styles.title}>러닝 기록</Text>
        {history.length === 0 ? (
          <Text style={styles.emptyText}>아직 러닝 기록이 없습니다.</Text>
        ) : (
          <FlatList
            data={history}
            renderItem={renderItem}
            keyExtractor={(item) => item.record_number.toString()}
            style={styles.list}
          />
        )}
        <Text style={styles.swipeHint}>왼쪽으로 스와이프하여 뒤로 가기</Text>
      </View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5EDFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
  },
  list: {
    flex: 1,
  },
  historyItem: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  historyText: {
    fontSize: 16,
    color: '#333',
  },
  swipeHint: {
    fontSize: 14,
    color: '#777',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
});