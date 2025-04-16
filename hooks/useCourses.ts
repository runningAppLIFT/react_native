import { useState } from 'react';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl;

export const useCourses = (user: { userId: string } | null) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isUserCoursesVisible, setIsUserCoursesVisible] = useState(false);
  const [isNearbyCoursesVisible, setIsNearbyCoursesVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleUserCourses = async () => {
    if (isUserCoursesVisible) {
      setIsUserCoursesVisible(false);
      setCourses([]);
      return;
    }

    if (!user?.userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (isNearbyCoursesVisible) {
      setIsNearbyCoursesVisible(false);
      setCourses([]);
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/courses/saves/${user.userId}`, {
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
          result.courses.map((course: any) => ({
            course_id: course.course_id,
            points: course.course_line.coordinates.map(([longitude, latitude]: [number, number]) => ({
              latitude,
              longitude,
            })),
          }))
        );
        setIsUserCoursesVisible(true);
      } else {
        alert('등록된 코스가 없습니다.');
      }
    } catch (error: any) { // error 타입 명시
      alert(`코스 불러오기에 실패했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleNearbyCourses = async (region: Coordinate | undefined) => {
    if (isNearbyCoursesVisible) {
      setIsNearbyCoursesVisible(false);
      setCourses([]);
      return;
    }
  
    if (isUserCoursesVisible) {
      setIsUserCoursesVisible(false);
      setCourses([]);
    }
  
    if (!region || region.latitude == null || region.longitude == null) {
      alert('위치 정보를 가져올 수 없습니다.');
      return;
    }
  
    setIsLoading(true);
    const { latitude, longitude } = region;
  
    try {
      const response = await fetch(
        `${API_URL}/courses/nearby?latitude=${latitude}&longitude=${longitude}&radius=1`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to load nearby courses: ${response.status} - ${errorText}`);
      }
  
      const result = await response.json();
      if (result.courses?.length > 0) {
        setCourses(
          result.courses.map((course: any) => ({
            course_id: course.course_id,
            title: course.title,
            distance: course.distance,
            description: course.description,
            points: Array.isArray(course.course_line?.coordinates)
              ? course.course_line.coordinates.map(([longitude, latitude]: [number, number]) => ({
                  latitude,
                  longitude,
                }))
              : [],
          }))
        );
        
        setIsNearbyCoursesVisible(true);
      } else {
        alert('근처에 등록된 코스가 없습니다.');
      }
    } catch (error: any) {
      alert(`근처 코스 불러오기에 실패했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  

  return {
    courses,
    setCourses,
    isUserCoursesVisible,
    isNearbyCoursesVisible,
    isLoading,
    handleToggleUserCourses,
    handleToggleNearbyCourses,
  };
};

export interface Course {
  course_id: number;
  title: string;
  distance: string;
  description?: string;
  points: Coordinate[];
}

interface Coordinate {
  latitude: number;
  longitude: number;
}