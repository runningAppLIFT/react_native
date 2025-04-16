import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import HorizontalPagination from './HorizontalPagination';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export interface Course {
  course_id: number;
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

export default function NearbyCoursesBottomSheet({
  isVisible,
  courses,
  onClose,
  handleSave,
}: NearbyCoursesBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);

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
                {item.description && <Text style={styles.distance}>{item.description}</Text>}
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
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
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
