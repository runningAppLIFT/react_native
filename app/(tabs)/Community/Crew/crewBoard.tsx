import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import Swiper from 'react-native-swiper';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

// Dummy data for crews (for fallback)
const dummyCrews = [
  {
    id: '1',
    name: '서울 러닝 크루',
    members: 25,
    description: '매주 주말 한강에서 함께 러닝하는 모임입니다.',
    isMyCrew: true,
    isUpcoming: false,
  },
  {
    id: '2',
    name: '강남 등산 모임',
    members: 15,
    description: '매달 첫째 주 일요일에 근교 산행을 즐깁니다.',
    isMyCrew: true,
    isUpcoming: true,
  },
  {
    id: '3',
    name: '홍대 보드게임 모임',
    members: 12,
    description: '보드게임 카페에서 정기적으로 모이는 모임입니다.',
    isMyCrew: false,
    isUpcoming: true,
  },
];

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

export default function CrewBoard() {
  const { id, name, members } = useLocalSearchParams(); // Get params passed from navigation
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [text, setText] = useState('');
  const [activeTab, setActiveTab] = useState('게시판'); // Set "게시판" as active tab

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
    <PanGestureHandler onGestureEvent={onGestureEvent}>
      <Animated.View style={{ flex: 1 }}>
        <ThemedView style={styles.container}>
          {/* 상단 헤더 */}
          <View style={styles.headerImageContainer}>
            <ThemedText type="title" style={styles.headerTitle}>
              크루
            </ThemedText>
          </View>

          {/* 탭 네비게이션 */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === '소개' && styles.activeTab]}
              onPress={() => {
                setActiveTab('소개');
                router.push({
                  pathname: '/(tabs)/Community/Crew/crewIntro',
                  params: {
                    id: id || dummyCrews[0].id,
                    name: name || dummyCrews[0].name,
                    members: members || dummyCrews[0].members.toString(),
                  },
                });
              }}
            >
              <Text style={[styles.tabText, activeTab === '소개' && styles.activeTabText]}>
                소개
              </Text>
              {activeTab === '소개' && <View style={styles.underline} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === '모임' && styles.activeTab]}
              onPress={() => {
                setActiveTab('모임');
                router.push('/(tabs)/Community/Crew/gathering');
              }}
            >
              <Text style={[styles.tabText, activeTab === '모임' && styles.activeTabText]}>
                모임
              </Text>
              {activeTab === '모임' && <View style={styles.underline} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === '게시판' && styles.activeTab]}
              onPress={() => {
                setActiveTab('게시판');
                router.push({
                  pathname: '/(tabs)/Community/Crew/communityIndex',
                  params: {
                    id: id || dummyCrews[0].id,
                    name: name || dummyCrews[0].name,
                    members: members || dummyCrews[0].members.toString(),
                  },
                });
              }}
            >
              <Text style={[styles.tabText, activeTab === '게시판' && styles.activeTabText]}>
                게시판
              </Text>
              {activeTab === '게시판' && <View style={styles.underline} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabButton}>
              <Text style={styles.tabText}>채팅</Text>
            </TouchableOpacity>
          </View>

          {/* 게시판 컨텐츠 */}
          <ThemedView style={styles.contentContainer}>
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
                      onPress={() => router.push({ pathname: '/(tabs)/Community/Crew/crewBoardDetail', params: { id: notice.id } })}
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
            />
            <TouchableOpacity style={styles.circleButton} onPress={() => router.push('/(tabs)/Community/Crew/addCrewPost')}>
              <Text style={styles.circlebtntext}>+</Text>
            </TouchableOpacity>
          </ThemedView>
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  activeTab: {
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0066FF',
    fontWeight: '700',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: '#0066FF',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingBottom: 80,
  },
  boardContainer: {
    paddingVertical: 4,
    paddingBottom: 80, // 하단 탭 높이만큼 여백 추가
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
    bottom: 90,
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