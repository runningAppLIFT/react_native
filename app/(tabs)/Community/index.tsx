import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import Swiper from 'react-native-swiper';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

type Post = {
  id: string;
  title: string;
  content: string;
  name: string;
  time: number;
  like: number;
  comment: number;
};

const initialPosts: Post[] = [
  { id: '1', title: '첫 번째 게시글', content: '이것은 첫 번째 게시글의 내용입니다.', name: '러닝광', time: 1, like: 2, comment: 4 },
  { id: '2', title: '두 번째 게시글', content: '이것은 두 번째 게시글의 내용입니다.', name: '러닝광', time: 2, like: 4, comment: 2 },
  { id: '3', title: '세 번째 게시글', content: '이것은 세 번째 게시글의 내용입니다.', name: '러닝광', time: 3, like: 1, comment: 1 },
];

const notices = [
  { id: 1, title: '게시판 이용 안내사항', date: '2025.03.28', content: '게시판 이용 방법과 규칙에 대해 안내드립니다.' },
  { id: 2, title: '새로운 기능 추가 안내', date: '2025.03.30', content: '새로운 기능이 추가되었습니다. 자세한 내용을 확인하세요.' },
  { id: 3, title: '시스템 점검 공지', date: '2025.04.01', content: '시스템 점검으로 인해 서비스 이용이 일시적으로 중단됩니다.' },
];

export default function CommunityIndex() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [text, setText] = useState('');
  const router = useRouter();

  const onGestureEvent = ({ nativeEvent }: { nativeEvent: { translationX: number } }) => {
    if (nativeEvent.translationX < -150) {
      router.push('/(tabs)/Community/Crew');
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(text.toLowerCase())
  );

  const renderItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postContainer}
      onPress={() => router.push({ pathname: '/(tabs)/Community/postDetail', params: { post: JSON.stringify(item) } })}
    >
      <ThemedText type="subtitle">{item.title}</ThemedText>
      <ThemedText>{item.content}</ThemedText>
      <View style={styles.contentinner}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ marginRight: 10 }}>{item.name}</Text>
          <Text>{`${item.time}시간 전`}</Text>
        </View>
        <View style={styles.likeContainer}>
          <IconSymbol name="message" color="#000" />
          <Text>{`${item.comment}`}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      activeOffsetX={[-10, 10]} // 스와이프 민감도 조정
    >
      <Animated.View style={{ flex: 1 }}>
        <ThemedView style={styles.container}>
          <ThemedView style={styles.headerImageContainer}>
            <ThemedText type="title" style={styles.headerText}>자유게시판</ThemedText>
          </ThemedView>

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
                    onPress={() => router.push({ pathname: '/(tabs)/Community/postDetail', params: { id: notice.id } })}
                  >
                    <ThemedText style={styles.noticetitle}>{notice.title}</ThemedText>
                    <ThemedText>{notice.date}</ThemedText>
                  </TouchableOpacity>
                ))}
              </Swiper>
            </View>
          </ThemedView>

          <FlatList
            data={filteredPosts}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.boardContainer}
            nestedScrollEnabled={true} // 중첩 스크롤 활성화
            initialNumToRender={10} // 렌더링 최적화
            windowSize={5} // 렌더링 최적화
          />

          <TouchableOpacity style={styles.circleButton} onPress={() => router.push('/(tabs)/Community/addPost')}>
            <Text style={styles.circlebtntext}>+</Text>
          </TouchableOpacity>
        </ThemedView>
      </Animated.View>
    </PanGestureHandler>
  );
}

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
    paddingBottom: Platform.OS === 'ios' ? 80 : 10, // 안드로이드에서 패딩 감소
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
    bottom: Platform.OS === 'ios' ? 90 : 10, // 안드로이드에서 패딩 감소
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
});