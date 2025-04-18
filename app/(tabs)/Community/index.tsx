import { FlatList, StyleSheet, Text, TouchableOpacity, View, Platform, ActivityIndicator, Alert } from 'react-native';
import { useEffect } from 'react';
import Swiper from 'react-native-swiper';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { usePosts, Post } from '@/hooks/community/usePosts';
import { useAuth } from '@/hooks/authContext'; // Import useAuth

// 공지사항 데이터 (정적 데이터로 유지)
const notices = [
  { id: 1, title: '게시판 이용 안내사항', date: '2025.03.28', content: '게시판 이용 방법과 규칙에 대해 안내드립니다.' },
  { id: 2, title: '새로운 기능 추가 안내', date: '2025.03.30', content: '새로운 기능이 추가되었습니다. 자세한 내용을 확인하세요.' },
  { id: 3, title: '시스템 점검 공지', date: '2025.04.01', content: '시스템 점검으로 인해 서비스 이용이 일시적으로 중단됩니다.' },
];

export default function CommunityIndex() {
  const router = useRouter();
  const { posts, isLoading, error, loadInitialPosts, loadMore, pageInfo } = usePosts();
  const { user } = useAuth(); // Get user from AuthContext

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialPosts();
  }, [loadInitialPosts]);

  // 제스처 이벤트 (오른쪽 스와이프 시 Crew 화면으로 이동)
  const onGestureEvent = ({ nativeEvent }: { nativeEvent: { translationX: number } }) => {
    if (nativeEvent.translationX < -150) {
      router.push('/(tabs)/Community/Crew');
    }
  };

  // 게시글 렌더링
  const renderItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postContainer}
      onPress={() =>
        router.push({
          pathname: '/(tabs)/Community/postDetail',
          params: { post: JSON.stringify(item) },
        })
      }
    >
      <ThemedText type="subtitle">{item.comm_title}</ThemedText>
      <ThemedText>{item.comm_detail}</ThemedText>
      <View style={styles.contentinner}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ marginRight: 10 }}>작성자 {item.user_id}</Text>
          <Text>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
        <View style={styles.likeContainer}>
          <IconSymbol name="message" color="#000" />
          <Text>0</Text> {/* 댓글 수는 API에 없으므로 0으로 표시 */}
        </View>
      </View>
    </TouchableOpacity>
  );

  // ListFooterComponent: 스크롤 끝에서의 UI
  const renderFooter = () => {
    if (isLoading) {
      return (
        <View style={styles.footerContainer}>
          <ActivityIndicator size="small" color="#0066FF" />
          <Text style={styles.footerText}>로딩 중...</Text>
        </View>
      );
    }
    if (pageInfo.hasNextPage) {
      return (
        <TouchableOpacity onPress={loadMore} style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: '#0066FF', fontWeight: '600' }]}>
            다음 게시물 불러오기
          </Text>
        </TouchableOpacity>
      );
    }
    if (posts.length > 0 && !pageInfo.hasNextPage) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>마지막 게시물입니다.</Text>
        </View>
      );
    }
    return null;
  };

  // 게시글 작성 버튼 클릭 핸들러
  const handleAddPost = () => {
    if (!user || !user.userId) {
      Alert.alert(
        '로그인 필요',
        '게시글을 작성하려면 로그인이 필요합니다. 로그인 화면으로 이동하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { text: '로그인', onPress: () => router.push('/(tabs)/Login') }, // Adjust the login route as needed
        ]
      );
    } else {
      router.push('/(tabs)/Community/addPost');
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      activeOffsetX={[-10, 10]} // 스와이프 민감도 조정
    >
      <Animated.View style={{ flex: 1 }}>
        <ThemedView style={styles.container}>
          {/* 헤더 */}
          <ThemedView style={styles.headerImageContainer}>
            <ThemedText type="title" style={styles.headerText}>자유게시판</ThemedText>
          </ThemedView>

          {/* 공지사항 Swiper */}
          <ThemedView style={styles.noticeContainer}>
            <ThemedText style={styles.noticeTop}>공지사항</ThemedText>
            <View style={styles.notice}>
              <Swiper
                autoplay
                autoplayTimeout={4}
                showsPagination={true}
                dotColor="lightgray"
                activeDotColor="black"
                dotStyle={{ width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 }}
                activeDotStyle={{ width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 }}
                height={60}
                paginationStyle={{ bottom: -10 }}
              >
                {notices.map(notice => (
                  <TouchableOpacity
                    key={notice.id}
                    onPress={() =>
                      router.push({
                        pathname: '/(tabs)/Community/postDetail',
                        params: { id: notice.id },
                      })
                    }
                  >
                    <ThemedText style={styles.noticetitle}>{notice.title}</ThemedText>
                    <ThemedText>{notice.date}</ThemedText>
                  </TouchableOpacity>
                ))}
              </Swiper>
            </View>
          </ThemedView>

          {/* 게시글 리스트 */}
          {error && <Text style={[styles.statusText, { color: 'red' }]}>{error}</Text>}
          {!isLoading && !error && posts.length === 0 && (
            <Text style={styles.statusText}>게시글이 없습니다.</Text>
          )}
          <FlatList
            data={posts}
            keyExtractor={(item) => item.comm_number.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.boardContainer}
            nestedScrollEnabled={true}
            initialNumToRender={10}
            windowSize={5}
            onEndReached={() => pageInfo.hasNextPage && loadMore()} // 더보기 호출
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter} // 푸터 컴포넌트 추가
          />

          {/* 플로팅 버튼 (게시글 추가) */}
          <TouchableOpacity
            style={styles.circleButton}
            onPress={handleAddPost} // Use the new handler
          >
            <Text style={styles.circlebtntext}>+</Text>
          </TouchableOpacity>
        </ThemedView>
      </Animated.View>
    </PanGestureHandler>
  );
}

// 스타일 수정 및 추가
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },
  headerImageContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0066FF',
    marginBottom: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    position: 'absolute',
  },
  boardContainer: {
    paddingVertical: 4,
    paddingHorizontal: 15,
    paddingBottom: Platform.OS === 'ios' ? 80 : 10,
  },
  postContainer: {
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  contentinner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    padding: 10,
    backgroundColor: '#EEF7FF',
    borderRadius: 8,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#0066FF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  noticeTop: {
    textAlign: 'left',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  notice: {
    paddingVertical: 12,
    flexDirection: 'column',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minHeight: 90,
  },
  noticetitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  circleButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 10,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  circlebtntext: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  statusText: {
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 20,
  },
  footerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#333',
  },
});