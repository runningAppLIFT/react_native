import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useMapStore } from '@/stores/mapStore';
import { useAuth } from '@/hooks/authContext';
import { useLocation } from '../../hooks/useLocation';
import { usePoints } from '../../hooks/useMapPoints';
import { useCourses } from '../../hooks/useCourses';

// 타입 정의
interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Region extends Coordinate {
  latitudeDelta: number;
  longitudeDelta: number;
}

interface Course {
  course_id: number;
  points: Coordinate[];
}

interface User {
  userId: string;
}

export default function MapScreen() {
  const { region, setRegion } = useMapStore();
  const { user } = useAuth();
  
  const [activeFunction, setActiveFunction] = useState<string | null>(null);
  const [isMoreOptionsVisible, setIsMoreOptionsVisible] = useState(false);
  const [isEditOptionsVisible, setIsEditOptionsVisible] = useState(false);

  const { points, setPoints, isAddingPoints, handleAddPointsToggle, handleRemoveLastPoint, handleMapPress } = usePoints();
  const { courses, setCourses, isUserCoursesVisible, isNearbyCoursesVisible, isLoading, handleToggleUserCourses, handleToggleNearbyCourses } = useCourses(user);

  useLocation(setRegion);

  const handleSavePoints = async () => {
    if (points.length === 0 || !user?.userId) {
      alert(!user?.userId ? '로그인이 필요합니다.' : '저장할 포인트가 없습니다.');
      return;
    }

    const payload = {
      user_id: parseInt(user.userId, 10),
      content: 'Sample route',
      points,
      status: 'active',
    };

    try {
      const response = await fetch('http://10.0.2.2:8080/courses/save-points', {
      // const response = await fetch('http://localhost:8080/courses/save-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Failed to save points: ${await response.text()}`);
      alert('경로가 저장되었습니다!');
      setPoints([]);
      setCourses([]);
    } catch (error: any) { // error 타입 명시
      alert(`경로 저장에 실패했습니다: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation
        region={region || undefined}
        onRegionChangeComplete={(newRegion: Region) => setRegion(newRegion)}
        onPress={(e) => handleMapPress(e, activeFunction)}
      >
        {points.map((point: Coordinate, index: number) => (
          <Marker
            key={index}
            coordinate={point}
            draggable
            onDragEnd={(e) => {
              const updatedPoints = [...points];
              updatedPoints[index] = e.nativeEvent.coordinate;
              setPoints(updatedPoints);
            }}
          />
        ))}
        {points.length > 1 && (
          <Polyline coordinates={points} strokeColor="#FF0000" strokeWidth={2} />
        )}
        {courses.map((course, index) => (
          <Polyline
            key={course.course_id}
            coordinates={course.points}
            strokeColor={`hsl(${index * 60}, 100%, 50%)`}
            strokeWidth={2}
          />
        ))}
      </MapView>

      <View style={styles.floatingButtons}>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.circleButton, styles.addButton]}
            onPress={() => {
              setIsEditOptionsVisible((prev) => !prev);
              if (!isEditOptionsVisible) setPoints([]);
              setIsMoreOptionsVisible(false);
            }}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
          {isEditOptionsVisible && (
            <View style={[styles.horizontalOptions, { right: 105 }]}>
              <TouchableOpacity style={styles.optionButton} onPress={() => {
                handleAddPointsToggle();
                setActiveFunction(isAddingPoints ? null : 'addPoints');
              }}>
                <Text style={styles.optionButtonText}>{isAddingPoints ? '중지' : '등록'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={handleRemoveLastPoint}>
                <Text style={styles.optionButtonText}>삭제</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={handleSavePoints}>
                <Text style={styles.optionButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.circleButton, styles.searchButton]}
            onPress={() => {
              setIsMoreOptionsVisible((prev) => !prev);
              setIsEditOptionsVisible(false);
              setPoints([]);
              setActiveFunction(null);
            }}
          >
            <Text style={styles.iconText}>🔍</Text>
          </TouchableOpacity>
          {isMoreOptionsVisible && (
            <View style={[styles.horizontalOptions, { top: -20, right: 135 }]}>
              <TouchableOpacity style={styles.optionButton} onPress={handleToggleUserCourses}>
                <Text style={styles.optionButtonText}>내 코스</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.optionButton} 
                onPress={() => region && handleToggleNearbyCourses(region)} // region이 null일 경우 호출 방지
              >
                <Text style={styles.optionButtonText}>근처 코스</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
    flex: 1,
    width: Dimensions.get('window').width,
  },
  floatingButtons: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    alignItems: 'flex-end',
  },
  buttonGroup: {
    position: 'relative',
    marginBottom: 20,
    alignItems: 'center',
  },
  circleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addButton: { // 추가
    backgroundColor: '#fff', // 필요에 따라 색상 조정 가능
  },
  searchButton: { // 추가
    backgroundColor: '#fff', // 필요에 따라 색상 조정 가능
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
    textAlign: 'center',
  },
  iconText: {
    fontSize: 24,
    height: 30,
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  horizontalOptions: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    top: 0,
    right: 70,
  },
  optionButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionButtonText: {
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'center',
    color: '#333',
  },
});