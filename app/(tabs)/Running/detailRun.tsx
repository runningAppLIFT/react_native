import React from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useRunRecorder } from '@/hooks/useRunRecorder'; // 경로 확인 필요

export default function DetailRunScreen() {
  const {
    routePath,
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
  } = useRunRecorder();

  // 문자열로 안전하게 변환
  const safeDate = Array.isArray(date) ? date[0] : date || '';
  const safeDistance = Array.isArray(distance) ? distance[0] : distance || '0';
  const safePace = Array.isArray(pace) ? pace[0] : pace || '';
  const safeTime = Array.isArray(time) ? time[0] : time || '';

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: routePath[0]?.latitude || 37.7749,
          longitude: routePath[0]?.longitude || -122.4194,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Polyline coordinates={routePath} strokeColor="#FF5E2B" strokeWidth={3} />
      </MapView>

      <TouchableOpacity style={styles.saveCourseButton} onPress={handleSaveCourse}>
        <Ionicons name="bookmark-outline" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.date}>{safeDate}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>거리</Text>
          <Text style={styles.infoValue}>{Number(safeDistance).toFixed(2)} km</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>페이스</Text>
          <Text style={styles.infoValue}>{safePace}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>시간</Text>
          <Text style={styles.infoValue}>{safeTime}</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="제목 입력"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="내용 입력"
          multiline
          value={description}
          onChangeText={setDescription}
        />
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>확인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.4,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    flex: 1,
  },
  date: {
    fontSize: 16,
    color: '#888',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  multilineInput: {
    minHeight: 80,
  },
  button: {
    backgroundColor: '#FF5E2B',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveCourseButton: {
    position: 'absolute',
    bottom: Dimensions.get('window').height * 0.5,
    right: 20,
    backgroundColor: '#FF5E2B',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});