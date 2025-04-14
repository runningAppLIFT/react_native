import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

const mockHistory = [
  { id: '1', date: '2025-04-10', distance: '5km', time: '30분' },
  { id: '2', date: '2025-04-09', distance: '8km', time: '45분' },
  { id: '3', date: '2025-04-08', distance: '3km', time: '20분' },
];

export default function RunningHistory() {
  const router = useRouter();

  const onGestureEvent = ({ nativeEvent }) => {
    if (nativeEvent.translationX > 150) {
      router.back();
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Text style={styles.historyText}>날짜: {item.date}</Text>
      <Text style={styles.historyText}>거리: {item.distance}</Text>
      <Text style={styles.historyText}>시간: {item.time}</Text>
    </View>
  );

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent}>
      <View style={styles.container}>
        <Text style={styles.title}>러닝 기록</Text>
        <FlatList
          data={mockHistory}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
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
});