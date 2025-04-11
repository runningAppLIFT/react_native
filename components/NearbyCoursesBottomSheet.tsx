import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import HorizontalPagination from './HorizontalPagination';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface Course {
  course_id : number;
  title: string;
  distance: string;
  description?: string;
  points?: { latitude: number; longitude: number }[];
}

interface NearbyCoursesBottomSheetProps {
  isVisible: boolean;
  courses: Course[];
  onClose: () => void;
  handleSave: (course: Course) => void;
}
// 더미 코스 데이터
// const mockCourses: Course[] = Array.from({ length: 12 }, (_, i) => ({
//   id: i + 1,
//   title: `코스 ${i + 1}`,
//   distance: `${(Math.random() * 2 + 1).toFixed(2)} km`,
// }));

export default function NearbyCoursesBottomSheet({
  isVisible,
  courses,
  onClose,
  handleSave,
}: NearbyCoursesBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  // 컴포넌트 표시 여부를 isVisible로 제어 (필요시)
  if (!isVisible) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={['30%', '60%']}
        backgroundStyle={{ borderRadius: 20 }}
      >
        <View style={styles.container}>
          <Text style={styles.title}>내 주변 코스</Text>
          <HorizontalPagination
            data={courses}
            itemsPerPage={4}
            renderItem={({ item }: { item: Course }) => (
              <View style={styles.card}>
                <Text style={styles.courseTitle}>{item.title}</Text>
                <Text style={styles.distance}>거리: {item.distance}</Text>
                <Text style={styles.distance}>{item.description}</Text>
                <TouchableOpacity style={styles.saveButton} onPress={() => handleSave(item)}>
                  <Text style={styles.saveText}>저장</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          {/* 닫기 버튼 등의 추가 UI를 원한다면 여기에 작성 */}
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>닫기</Text>
          </TouchableOpacity>
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
  closeText: {
    marginTop: 10,
    color: '#007AFF',
    textAlign: 'center',
  },
});
