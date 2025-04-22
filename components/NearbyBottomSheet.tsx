import { useCourses } from '@/hooks/useCourses';
import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Animated,
  PanResponder,
  Dimensions,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface Course {
  course_id: number;
  course_title: string;
  course_content: string;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  courses: Course[];
  onSelectCourse: (course_id: number) => void; 
  loading: boolean;
}



export const NearbyBottomSheet: React.FC<Props> = ({
  isVisible,
  onClose,
  courses,
  onSelectCourse,
}) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const {setCourses, coursesSave, isLoading } = useCourses({
    userId: ''
  });

  const itemsPerPage = 4;

  const translateY = useRef(new Animated.Value(height)).current;
  
  const flatListRef = useRef<FlatList<any>>(null);

  const selectedCourseFromList = useMemo(() => {
    return courses.find(c => c.course_id === selectedCourse?.course_id);
  }, [onSelectCourse, courses]);

  const handleSaveCourse = (course: Course) => {
    if (courses) {
      coursesSave(courses); 
    }
  };


  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      handleClose();
    }
  }, [isVisible]);

  useEffect(() => {
    if (!selectedCourse || !courses.length) return;
  
    const index = courses.findIndex(c => c.course_id === selectedCourse.course_id);
  
    // 못 찾았으면 실행하지 않음
    if (index === -1) return;
  
    const page = Math.floor(index / itemsPerPage);
  
    // 페이지 스크롤
    flatListRef.current?.scrollToOffset({
      offset: (width - 32) * page,
      animated: true,
    });
  
    setCurrentPage(page + 1);
  }, [selectedCourse, courses]);
  


  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(onClose);
  };


  
  const totalPages = Math.ceil(courses.length / itemsPerPage);

  
  const pages = useMemo(() => {
    const totalPages = Math.ceil(courses.length / itemsPerPage);
    return Array.from({ length: totalPages }, (_, pageIndex) =>
      courses.slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage)
    );
  }, [courses]);
  

  const renderPagination = () => (
    <View style={styles.pagination}>
      {Array.from({ length: totalPages }).map((_, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => {
            setCurrentPage(i + 1);
            flatListRef.current?.scrollToOffset({
              offset: (width - 32) * i,
              animated: true,
            });
          }}
          style={[
            styles.pageBtn,
            currentPage === i + 1 && { backgroundColor: '#ccc' }, // 현재 페이지 강조
          ]}
        >
          <Text style={styles.pageText}>{i + 1}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  

  return (
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
           {isLoading ? (
            <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>코스를 불러오는 중...</Text>
        </View>
        ) :selectedCourseFromList  ? (
            <View>
              <TouchableOpacity onPress={() => setSelectedCourse(null)}>
                <Text style={styles.backBtn}>←</Text>
              </TouchableOpacity>
              <Text style={styles.title}>{`${selectedCourseFromList.course_id}. ${selectedCourseFromList .course_title}`}</Text>
              <Text style={styles.detailText}>코스 설명 : {selectedCourseFromList.course_content}</Text>
              <TouchableOpacity onPress={() => handleSaveCourse(selectedCourseFromList)}>
                <Text style={styles.saveIcon}>💾 저장</Text>
              </TouchableOpacity>
            </View> 
          ) : (
            <View>
              <Text style={styles.title}>내 근처 코스</Text>
              <FlatList
                data={pages}
                ref={flatListRef}
                keyExtractor={(item) => item.course_id}
                initialScrollIndex={(currentPage - 1) * itemsPerPage}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                getItemLayout={(_, index) => ({
                  length: width - 32,
                  offset: (width - 32) * index,
                  index,
                })}
                onMomentumScrollEnd={(e) => {
                  const page = Math.round(
                    e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width
                  );
                  setCurrentPage(page + 1);
                }}
                renderItem={({ item: courseGroup, index }) => (
                  <View style={{ width: width - 32 }}>
                    {courseGroup.map((item, idx) => (
                      <TouchableOpacity
                        key={item.course_id}
                        style={styles.item}
                        onPress={() => {
                          setSelectedCourse(item);              // 내부 상세 보여주기
                          onSelectCourse(item.course_id);       // 외부 지도에 알림
                        }}
                      >
                        <Text style={styles.itemText}>
                          {(index * itemsPerPage) + idx + 1}. {item.course_title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
              {renderPagination()}
            </View>
          )}
        </Animated.View>
      </View>

  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
  },
  sheet: {
    height: height * 0.35,
    backgroundColor: '#F5F8FC',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 16,
  },
  title2: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 24,
    marginLeft: 100,
    textAlign: 'center',
  },
  item: {
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderRadius: 12,
    borderBottomColor: '#fff',
    backgroundColor: '#A1CEFF',
  },
  itemText: {
    fontSize: 18,
    fontWeight: '500',
    paddingRight: 12,
  },
  backBtn: {
    fontSize: 24,
    marginBottom: 12,
    marginRight: 12,
    fontWeight: 'bold',
  },
  detailText: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#A1CEFF',
    height: 100,
    borderRadius: 12,
  },
  saveIcon: {
    fontSize: 16,
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  pageBtn: {
    marginHorizontal: 6,
    padding: 6,
    backgroundColor: '#eee',
    borderRadius: 6,
  },
  pageText: {
    fontSize: 14,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
});