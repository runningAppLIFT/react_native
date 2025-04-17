import React, { useRef, useEffect, useState } from 'react';
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
  courses: Course[];
}

export const NearbyBottomSheet: React.FC<Props> = ({
  isVisible,
  onClose,
  courses,
}) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

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

  const totalPages = Math.ceil(courses.length / itemsPerPage);

  
  const pages = Array.from({ length: totalPages }, (_, pageIndex) =>
    courses.slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage)
  );

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
    <TouchableWithoutFeedback onPress={handleClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          {selectedCourse ? (
            <View>
              <TouchableOpacity onPress={() => setSelectedCourse(null)}>
                <Text style={styles.backBtn}>←</Text>
              </TouchableOpacity>
              <Text style={styles.title}>{`${selectedCourse.course_id}. ${selectedCourse.course_title}`}</Text>
              <Text style={styles.detailText}>{selectedCourse.course_content}</Text>
              <TouchableOpacity>
                {/* <Text style={styles.saveIcon}  onPress={()=>({}) }>💾 저장</Text> */}
                <Text style={styles.saveIcon}>💾 저장</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.title}>내 근처 코스</Text>
              <FlatList
                data={pages}
                ref={flatListRef}
                keyExtractor={(_, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
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
                        onPress={() => setSelectedCourse(item)}
                      >
                        <Text style={styles.itemText}>
                          {(index * itemsPerPage) + idx + 1}. {item.course_content}
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
    // backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: height * 0.3,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  item: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 14,
  },
  backBtn: {
    fontSize: 20,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    marginVertical: 4,
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
});