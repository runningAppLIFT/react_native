
import { Mybottomsheet } from '@/components/Mybottomsheet';
import { useAuth } from '@/hooks/authContext';
import { useCourses } from '@/hooks/useCourses';
import { usePoints } from '@/hooks/useMapPoints';
import { useMapStore } from '@/stores/mapStore';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import MapView, { Marker, Polyline } from 'react-native-maps';

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

const onGestureEvent = ({ nativeEvent }: { nativeEvent: { translationX: number } }) => {
  if (nativeEvent.translationX > 150) {
    router.push('/(tabs)/myPage');
  }
};




export default function MyPageLeft() {
  const { region, setRegion } = useMapStore();
  const { user } = useAuth();

  const [activeFunction, setActiveFunction] = useState<string | null>(null);
  const { points, setPoints, handleMapPress } = usePoints();
  const { courses, setCourses, isUserCoursesVisible, isNearbyCoursesVisible, isLoading, handleToggleUserCourses, handleToggleNearbyCourses } = useCourses(user);

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (region) {
      handleToggleNearbyCourses(region); // 근처 코스 
      handleToggleUserCourses(region); // 코스 정보 
    }
  }, []);

  return (
      <PanGestureHandler onGestureEvent={onGestureEvent}>
        <Animated.View style={{ flex: 1 }}>
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

            <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => {
              if (region) {
                handleToggleNearbyCourses(region);
                handleToggleUserCourses(region);
              setIsVisible(true)
              }
            }} // 근처 코스 불러오기 및 BottomSheet 열기
          >
           <Text style={styles.iconText}>
              탭 다시보기
            </Text>
          </TouchableOpacity>
            </View>
             {/* BottomSheet 컴포넌트 */}
                  {isVisible && (
                    <Mybottomsheet isVisible={isVisible} onClose={() => {
                      if (region!) { 
                        handleToggleNearbyCourses(region); // 근처 코스 
                        handleToggleUserCourses(region); // 코스 정보 
                        setIsVisible(false) // BottomSheet 닫기
                      }}} 
                      registeredCourses={courses} // 코스데이터 전달 
                      savedCourses={courses} // 코스데이터 전달 

                      />
                  )}
                  {/*  BottomSheet 컴포넌트 끝 */}
    </View>
    </Animated.View>
      </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  map: {
      flex: 1,
      width: Dimensions.get('window').width,
    },

  btnContainer: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#fff',
    borderRadius: 50,
    margin: 10,
  },
  searchButton: {
    backgroundColor: '#A1CEFF',
    borderRadius: 50,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
    color: '#000',
  },
  
});
