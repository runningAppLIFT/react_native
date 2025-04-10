import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import HorizontalPagination from './HorizontalPagination';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const SCREEN_WIDTH = Dimensions.get('window').width;

// 더미 코스 데이터
const mockCourses = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: `코스 ${i + 1}`,
  distance: `${(Math.random() * 2 + 1).toFixed(2)} km`,
}));

export default function NearbyCoursesBottomSheet() {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleSave = (course: any) => {
    // 저장 처리
    console.log('저장할 코스:', course);
    alert(`"${course.title}" 코스가 저장되었습니다.`);
  };

  return (
    <GestureHandlerRootView>
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={['30%', '60%']}
      backgroundStyle={{ borderRadius: 20 }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>내 주변 코스</Text>

        <HorizontalPagination
          data={mockCourses}
          itemsPerPage={4}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.courseTitle}>{item.title}</Text>
              <Text style={styles.distance}>거리: {item.distance}</Text>
              <TouchableOpacity style={styles.saveButton} onPress={() => handleSave(item)}>
                <Text style={styles.saveText}>저장</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </BottomSheet>
    </GestureHandlerRootView>

  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  distance: {
    marginVertical: 6,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
