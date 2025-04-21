import React, {useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Modal, TextInput } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useMapStore } from '@/stores/mapStore';
import { useAuth } from '@/hooks/authContext';
import { useLocation } from '../../hooks/useLocation';
import { usePoints } from '../../hooks/useMapPoints';
import { useCourses } from '../../hooks/useCourses';
import { getDistance } from 'geolib'; 

import Constants from 'expo-constants';
import { NearbyBottomSheet } from '@/components/NearbyBottomSheet';
import { MaterialIcons } from '@expo/vector-icons';

const API_URL = Constants.expoConfig?.extra?.apiUrl;


// 타입 정의
interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Region extends Coordinate {
  latitudeDelta: number;
  longitudeDelta: number;
}


interface User {
  userId: string;
}

interface Course {
  course_id: number;
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
  const mapRef = useRef<MapView>(null);
  
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

  // BottomSheet 관련 상태
  const [isVisible, setIsVisible] = useState(false);

  // 코스
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

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
      course_title: courseTitle,      
      course_content: courseDescription, 
      points,
      status: 'active',
    };

    try {
      const response = await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.text(); // or response.json() if you expect JSON

      if (!response.ok) throw new Error(`(${response.status}) ${result}`);

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
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        region={region || undefined}
        onRegionChangeComplete={(newRegion: Region) => setRegion(newRegion)}
        onPress={(e) => handleMapPress(e, activeFunction)}
      >

      {points.length > 1 && (
          <Polyline coordinates={points} strokeColor="#FF0000" strokeWidth={2} />
        )}

         {courses.map((course) => (
            (selectedCourseId === null || selectedCourseId === course.course_id) && (
              <Marker
                key={`marker-${course.course_id}`}
                coordinate={course.points[0]}
                pinColor="blue"
                onPress={() => {
                  console.log('Marker pressed:', course.course_id);
                  setSelectedCourseId(course.course_id); // 선택된 코스 설정
                  setIsVisible(true);                    // BottomSheet 열기
                }}
                
              />
            )
          ))}


         {/* 모든 코스의 시작점만 마커로 표시 */}
         {selectedCourseId !== null && (
            courses
              .filter(c => c.course_id === selectedCourseId)
              .map((course, index) => (
                <Polyline
                  key={`polyline-${course.course_id}`}
                  coordinates={course.points}
                  strokeColor={`hsl(${index * 60}, 100%, 50%)`}
                  strokeWidth={2}
                />
      ))
  )}
     
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
              if (region) {
                handleToggleNearbyCourses(region);
                handleToggleUserCourses(region); // 코스 정보
              setIsVisible(true)
              }
            }} // 근처 코스 불러오기 및 BottomSheet 열기
          >
            <MaterialIcons name="search" size={24} color="black" style={styles.iconText} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 저장 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSaveModalVisible}
        onRequestClose={() => setIsSaveModalVisible(false)}>

        <View style={styles.modalBackground}>
          <View style={styles.saveModalView}>
            <Text style={styles.modalTitle}>코스 등록</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="코스 제목을 입력하세요"
              value={courseTitle}
              onChangeText={setCourseTitle}/>

             <Text style={styles.distanceText}> 총 거리: {distanceInKm} km</Text>

            <TextInput
              style={[styles.modalInput, { height: 80 }]}
              placeholder="코스 설명을 입력하세요"
              multiline
              value={courseDescription}
              onChangeText={setCourseDescription}/>

            <View style={styles.modalButtonGroup}>
            <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSavePoints}>
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

      {/* 완료 모달 */}
      <Modal
      animationType="fade"
      transparent={true}
      visible={isCompletedModalVisible}
      onRequestClose={() => setIsCompletedModalVisible(false)}
    >
      <View style={styles.modalBackground}>
        <View style={styles.completeModalView}>
          <Text style={styles.modalTitle}>저장완료</Text>
          <Text style={styles.modalMessage}>코스가 저장되었습니다!</Text>

          <TouchableOpacity
            onPress={() => setIsCompletedModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>
      </Modal>



      {/* BottomSheet 컴포넌트 */}
      {isVisible && (
        <NearbyBottomSheet isVisible={isVisible} onClose={() => {
          if (region!) { 
            handleToggleNearbyCourses(region); // 근처 코스 
            handleToggleUserCourses(region); // 코스 정보 
            setIsVisible(false) // BottomSheet 닫기
            setSelectedCourseId(null); // BottomSheet 닫을 때 전체 다시 보여줌
          }}} 
          courses={courses} // 코스데이터 전달
          loading={isLoading} 
          onSelectCourse={(course_id) => {
            setSelectedCourseId(course_id);
        
            // 해당 코스 포인트를 찾아서 지도의 중심/줌 조정
            const selectedCourse = courses.find(c => c.course_id === course_id);
            if (selectedCourse && selectedCourse.points.length > 0) {
              const coordinates = selectedCourse.points;
              mapRef.current?.fitToCoordinates(coordinates, {
                edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                animated: true,
              });
            }
          }}
          
        />
      )}
      {/*  BottomSheet 컴포넌트 끝 */}

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
    backgroundColor: '#A1CEFF', // 필요에 따라 색상 조정 가능
  },
  searchButton: { // 추가
    backgroundColor: '#A1CEFF', // 필요에 따라 색상 조정 가능
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
    color: 'black',
    fontSize: 16,
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
  modalMessage: {
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
  },

});