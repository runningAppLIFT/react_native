import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useMapStore } from '@/stores/mapStore';
import { useAuth } from '@/hooks/authContext';

export default function MapScreen() {
  const { region, setRegion } = useMapStore();
  const { user } = useAuth();

  // 상태 관리
  const [isAddingPoints, setIsAddingPoints] = useState(false); // 등록 모드
  const [isUserCoursesVisible, setIsUserCoursesVisible] = useState(false); // 내 코스 활성화 상태
  const [isNearbyCoursesVisible, setIsNearbyCoursesVisible] = useState(false); // 근처 코스 활성화 상태
  const [activeFunction, setActiveFunction] = useState(null);
  const [points, setPoints] = useState([]); // 현재 등록 중인 포인트
  const [courses, setCourses] = useState([]); // 불러온 코스
  const [isMoreOptionsVisible, setIsMoreOptionsVisible] = useState(false); // 돋보기 세부 메뉴 표시
  const [isEditOptionsVisible, setIsEditOptionsVisible] = useState(false); // 등록 버튼 세부 메뉴 표시
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  // 위치 권한 요청 및 현재 위치 설정
  useEffect(() => {
    async function getCurrentLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.02,
      });
    }
    getCurrentLocation();
  }, [setRegion]);

  const handleAddPointsToggle = () => {
    const newState = !isAddingPoints;
    setIsAddingPoints(newState);
    setActiveFunction(newState ? 'addPoints' : null);

    if (!newState) {
      // 등록이 중지되면 데이터 초기화
      setPoints([]);
      setCourses([]);
    }

    // + 버튼이 눌리면 돋보기 관련 토글 비활성화
    setIsMoreOptionsVisible(false);
  };

  const handleMapPress = async (e) => {
    if (activeFunction !== 'addPoints' && activeFunction !== 'nearbyCourses') return;

    const newPoint = e.nativeEvent.coordinate;
    if (activeFunction === 'addPoints') {
      setPoints([...points, newPoint]);
    } else if (activeFunction === 'nearbyCourses') {
      setPoints([newPoint]);
      await loadNearbyCourses(newPoint.latitude, newPoint.longitude);
    }
  };

  const handleRemoveLastPoint = () => {
    if (points.length === 0) return;
    const updatedPoints = points.slice(0, -1);
    setPoints(updatedPoints);
    setCourses([]);
  };

  const handleSavePoints = async () => {
    if (points.length === 0) return;

    if (!user || !user.userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    setIsLoading(true);
    const payload = {
      user_id: parseInt(user.userId, 10),
      content: 'Sample route',
      points: points,
      status: 'active',
    };

    try {
      const response = await fetch('http://localhost:8080/courses/save-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save points: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      alert('경로가 저장되었습니다!');
      setPoints([]);
      setCourses([]);
    } catch (error) {
      alert(`경로 저장에 실패했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserCourses = async () => {
    // 사용자 코스 활성화/비활성화 토글
    if (isUserCoursesVisible) {
      // 이미 활성화 상태 -> 비활성화 (데이터 초기화)
      setIsUserCoursesVisible(false);
      setCourses([]);
    } else {
      // 비활성화 상태 -> API 호출하여 데이터 로드
      if (!user || !user.userId) {
        alert('로그인이 필요합니다.');
        return;
      }
  
      // 근처 코스가 활성화 된 경우, 비활성화
      if (isNearbyCoursesVisible) {
        setIsNearbyCoursesVisible(false);
        setCourses([]);
      }
  
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/courses/user/${user.userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to load courses: ${response.status} - ${errorText}`);
        }
  
        const result = await response.json();
        if (result.courses.length > 0) {
          setCourses(
            result.courses.map((course) => ({
              course_id: course.course_id,
              points: course.course_line.coordinates.map(([longitude, latitude]) => ({
                latitude,
                longitude,
              })),
            }))
          );
          setIsUserCoursesVisible(true); // 활성화 상태로 변경
        } else {
          alert('등록된 코스가 없습니다.');
        }
      } catch (error) {
        alert(`코스 불러오기에 실패했습니다: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleToggleNearbyCourses = async () => {
    // 근처 코스 활성화/비활성화 토글
    if (isNearbyCoursesVisible) {
      // 이미 활성화 상태 -> 비활성화 (데이터 초기화)
      setIsNearbyCoursesVisible(false);
      setCourses([]);
    } else {
      // 비활성화 상태 -> API 호출하여 데이터 로드
      if (isUserCoursesVisible) {
        // 내 코스가 활성화 상태일 경우 비활성화
        setIsUserCoursesVisible(false);
        setCourses([]);
      }
  
      setIsLoading(true);
      const { latitude, longitude } = region || {};
      try {
        const response = await fetch(
          `http://localhost:8080/courses/nearby?latitude=${latitude}&longitude=${longitude}&radius=1`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        );
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to load nearby courses: ${response.status} - ${errorText}`);
        }
  
        const result = await response.json();
        if (result.courses && result.courses.length > 0) {
          setCourses(
            result.courses.map((course) => ({
              course_id: course.course_id,
              points: course.course_line.coordinates.map(([longitude, latitude]) => ({
                latitude,
                longitude,
              })),
            }))
          );
          setIsNearbyCoursesVisible(true); // 활성화 상태로 변경
        } else {
          alert('근처에 등록된 코스가 없습니다.');
        }
      } catch (error) {
        alert(`근처 코스 불러오기에 실패했습니다: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };
  

  return (
    <View style={styles.container}>
      {/* 지도 */}
      <MapView
        style={styles.map}
        showsUserLocation
        region={region || undefined}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        onPress={handleMapPress}
      >
        {points.map((point, index) => (
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
        {/* Add/Edit Options Block */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.circleButton, styles.addButton]}
            onPress={() => {
              setIsEditOptionsVisible((prev) => !prev);
              if (!isEditOptionsVisible) {
                setPoints([]); // 데이터를 초기화
              }
              setIsMoreOptionsVisible(false); // 돋보기 토글 해제
            }}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
          {isEditOptionsVisible && (
            <View style={[styles.horizontalOptions, { right: 105 }]}>
              <TouchableOpacity style={styles.optionButton} onPress={handleAddPointsToggle}>
                <Text style={styles.optionButtonText}>
                  {isAddingPoints ? '중지' : '등록'}
                </Text>
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

        {/* Search Options Block */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.circleButton, styles.searchButton]}
            onPress={() => {
              setIsMoreOptionsVisible((prev) => !prev);
              setIsEditOptionsVisible(false); // + 버튼 토글 해제
              setPoints([]); // 등록 중 데이터 초기화
              setIsAddingPoints(false); // 등록 모드 종료
            }}
          >
            <Text style={styles.iconText}>🔍</Text>
          </TouchableOpacity>
          {isMoreOptionsVisible && (
            <View style={[styles.horizontalOptions, { top: -20, right: 135 }]}>
              {/* top 속성을 조정하여 옵션 버튼 높이 이동 */}
              <TouchableOpacity style={styles.optionButton} onPress={handleToggleUserCourses}>
                <Text style={styles.optionButtonText}>내 코스</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={handleToggleNearbyCourses}>
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
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
    textAlign: 'center',
  },
  iconText: {
    fontSize: 24, // 이모지 크기를 조절
    height: 30, // 높이 고정으로 중앙 정렬
    textAlignVertical: 'center', // 이모지 수직 중앙 정렬
    textAlign: 'center', // 수평 중앙 정렬
  },
  horizontalOptions: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center', // 텍스트 또는 이모지를 높이 기준 정렬
    top: 0, // 중앙 정렬
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
