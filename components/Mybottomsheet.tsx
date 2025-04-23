import { useAuth } from '@/hooks/authContext';
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
  TouchableWithoutFeedback,
  FlatList,
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
  registeredCourses: Course[];
  savedCourses: Course[];
  onSelectCourse: (course_id: number) => void; 
}

export const Mybottomsheet: React.FC<Props> = ({
  isVisible,
  onClose,
  registeredCourses,
  savedCourses,
  onSelectCourse,
}) => {
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'registered' | 'saved'>('registered');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const { user } = useAuth();
  const {setCourses, coursesDelete, isLoading } = useCourses(user);

  const translateY = useRef(new Animated.Value(height)).current;
  const flatListRef = useRef<FlatList<any>>(null);

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

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(onClose);
  };

  const courses = activeTab === 'registered' ? registeredCourses : savedCourses;
  const totalPages = Math.ceil(courses.length / itemsPerPage);

  const pages = useMemo(() => {
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
            currentPage === i + 1 && { backgroundColor: '#ccc' },
          ]}
        >
          <Text style={styles.pageText}>{i + 1}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={handleClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'registered' && styles.activeTab]}
              onPress={() => {
                setActiveTab('registered');
                setCurrentPage(1);
              }}
            >
              <Text style={styles.tabText}>내 등록 코스</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'saved' && styles.activeTab]}
              onPress={() => {
                setActiveTab('saved');
                setCurrentPage(1);
              }}
            >
              <Text style={styles.tabText}>내 저장 코스</Text>
            </TouchableOpacity>
          </View>

            <FlatList
                   data={pages}
                   ref={flatListRef}
                   keyExtractor={(_, index) => index.toString()}
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
                          <View
                            key={item.course_id}
                            style={styles.item}
                          >
                            <Text style={styles.itemText}>
                              {(index * itemsPerPage) + idx + 1}. {item.course_title}
                            </Text>
                            <TouchableOpacity
                             onPress={async () => {
                              await coursesDelete(item.course_id);
                            }}
                          >
                              <Text style={{ color: 'red' }}>삭제</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                     </View>
                   )}
                 />
                 {renderPagination()}
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
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
    height: height * 0.4,
    backgroundColor: '#F5F8FC',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
  },
  activeTab: {
    backgroundColor: '#fff',
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  item: {
    flexDirection: 'row',           // 가로 정렬
    justifyContent: 'space-between', // 좌우로 요소 배치
    alignItems: 'center',           // 수직 중앙 정렬\
    
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#A1CEFF',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  itemText: {
    fontSize: 18,
    fontWeight: '500',
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
  itemsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    width: width - 32,
  },
});
