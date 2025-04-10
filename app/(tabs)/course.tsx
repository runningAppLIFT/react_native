import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Modal, TextInput } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useMapStore } from '@/stores/mapStore';
import { useAuth } from '@/hooks/authContext';
import { useLocation } from '../../hooks/useLocation';
import { usePoints } from '../../hooks/useMapPoints';
import { useCourses } from '../../hooks/useCourses';
import NearbyCoursesBottomSheet from '@/components/NearbyCoursesBottomSheet';
import { getDistance } from 'geolib'; 

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
  id: number;
  title: string;
  distance: number;
  points: Coordinate[];
}

interface User {
  userId: string;
}

// 포인트 배열로 총 거리를 계산하는 함수 (미터 단위)
const getTotalDistance = (points: Coordinate[]): number => {
  let distance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    distance += getDistance(points[i], points[i + 1]);
  }
  return distance;
};


export default function MapScreen() {
  const { region, setRegion } = useMapStore();
  const { user } = useAuth();


  
  const [activeFunction, setActiveFunction] = useState<string | null>(null);
  const [isMoreOptionsVisible, setIsMoreOptionsVisible] = useState(false);
  const [isEditOptionsVisible, setIsEditOptionsVisible] = useState(false);

  // 저장 모달 창을 위한 상태 추가
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');       // 코스 제목
  const [courseDescription, setCourseDescription] = useState(''); // 코스 설명

  // 저장 완료 모달 관련 상태
  const [isCompletedModalVisible, setIsCompletedModalVisible] = useState(false);

  const { points, setPoints, isAddingPoints, handleAddPointsToggle, handleRemoveLastPoint, handleMapPress } = usePoints();
  const { courses, setCourses, isUserCoursesVisible, isNearbyCoursesVisible, isLoading, handleToggleUserCourses, handleToggleNearbyCourses } = useCourses(user);

  useLocation(setRegion);

  const openSaveModal = () => {
    // 저장할 포인트가 있는지 체크 후 모달 오픈
    if (points.length === 0) {
      alert('저장할 포인트가 없습니다.');
      return;
    }
    if (!user?.userId) {
      alert('로그인이 필요합니다.');
      return;
    }
    setIsSaveModalVisible(true);
  };


  const handleSavePoints = async () => {
    if (points.length === 0 || !user?.userId) {
      alert(!user?.userId ? '로그인이 필요합니다.' : '저장할 포인트가 없습니다.');
      return;
    }

    const payload = {
      user_id: parseInt(user.userId, 10),
      title: courseTitle, 
      description: courseDescription,
      content: 'Sample route',
      points,
      status: 'active',
    };

    try {
      const response = await fetch(`http://localhost:8080/courses/saves/${user.userId}`, {
      // const response = await fetch(`https://lift-back-nest-693289168050.us-central1.run.app/courses/saves/${user.userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Failed to save points: ${await response.text()}`);
      setIsCompletedModalVisible(true);

      setPoints([]);
      setCourses([]);
      setCourseTitle('');
      setCourseDescription('');
      setIsSaveModalVisible(false);
    } catch (error: any) { // error 타입 명시
      alert(`경로 저장에 실패했습니다: ${error.message}`);
    }
  };

    // 총 거리 (미터 단위)를 계산하고 km 단위로 표시
    const totalDistance = points.length > 1 ? getTotalDistance(points) : 0;
    const distanceInKm = (totalDistance / 1000).toFixed(2); // km 단위, 소수점 2자리

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
              <TouchableOpacity style={styles.optionButton} onPress={openSaveModal}>
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
        {/* <NearbyCoursesBottomSheet
          isVisible={isUserCoursesVisible || isNearbyCoursesVisible}
          courses={courses}
          onClose={() => {
            // 코스 목록을 닫을 때 관련 상태들을 초기화하거나 토글하는 로직 추가
            handleToggleUserCourses();
            region && handleToggleNearbyCourses(region);
          }}
          handleSave={handleSavePoints}
        /> */}
      </View>

      {/* 저장 모달 - 이후 컴포넌트로 수정 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSaveModalVisible}
        onRequestClose={() => setIsSaveModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.saveModalView}>
            <Text style={styles.modalTitle}>코스 등록</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="코스 제목을 입력하세요"
              value={courseTitle}
              onChangeText={setCourseTitle}
            />
             <Text style={styles.distanceText}>
              총 거리: {distanceInKm} km
            </Text>

            <TextInput
              style={[styles.modalInput, { height: 80 }]}
              placeholder="코스 설명을 입력하세요"
              multiline
              value={courseDescription}
              onChangeText={setCourseDescription}
            />
            <View style={styles.modalButtonGroup}>
            <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSavePoints}
              >
                <Text style={styles.modalButtonText}>저장</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setIsSaveModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
           
            </View>
          </View>
        </View>
      </Modal>

      {/* 완료 모달 - 이후 컴포넌트로 수정 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isCompletedModalVisible}
        onRequestClose={() => setIsCompletedModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.completeModalView}>
            <Text style={styles.completeText}>저장 완료</Text>
            <Text style={styles.completeText}>코스가 저장되었습니다!</Text>
          </View>
          <TouchableOpacity
            style={[styles.modalButton, styles.modalSaveButton]}
            onPress={() => setIsCompletedModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    
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
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveModalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
  },
  modalButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalCancelButton: {
    backgroundColor: '#ccc',
  },
  modalSaveButton: {
    backgroundColor: '#2196F3',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  distanceText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
  },
  completeModalView: {
    width: '70%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 10,
  },
  completeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },

});