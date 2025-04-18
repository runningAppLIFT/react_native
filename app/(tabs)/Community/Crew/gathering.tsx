import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SearchBar } from '@/components/SearchBar';
import { useState } from 'react';

// Dummy data for crews
const dummyCrews = [
  {
    id: '1',
    name: '서울 러닝 모임',
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

export default function Gathering() {
  const { id, name, members } = useLocalSearchParams();
  const router = useRouter();
  const [text, setText] = useState('');
  const [activeTab, setActiveTab] = useState('모임'); // Track active tab

  // Filter crews based on search text
  const filteredCrews = dummyCrews.filter(crew =>
    crew.name.toLowerCase().includes(text.toLowerCase())
  );

  // Render individual crew item
  const renderCrewItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.crewListItem}
      onPress={() => {
        router.push({
          pathname: '/(tabs)/Community/Crew/crewIntro',
          params: {
            id: item.id,
            name: item.name,
            members: item.members.toString(),
          },
        });
      }}
    >
      <View style={styles.imageContainer}>
        <Text style={styles.imagePlaceholder}>이미지</Text>
      </View>
      <View style={styles.crewDetails}>
        <ThemedText style={styles.crewName}>{item.name}</ThemedText>
        <Text style={styles.crewMembers}>{`${item.members}명 참여중`}</Text>
      </View>
      {item.isMyCrew ? (
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>취소하기</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>참여하기</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.headerImageContainer}>
        <ThemedText type="title" style={styles.headerTitle}>
          크루
        </ThemedText>
      </View>

      {/* 크루 모임 내용 */}
      <View style={styles.contentContainer}>
        {/* 탭 네비게이션 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === '소개' && styles.activeTab]}
            onPress={() => {
              setActiveTab('소개');
              const firstCrew = dummyCrews[0];
              router.push({
                pathname: '/(tabs)/Community/Crew/crewIntro',
                params: {
                  id: firstCrew.id,
                  name: firstCrew.name,
                  members: firstCrew.members.toString(),
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
              const firstCrew = dummyCrews[0];
              router.push({
                pathname: '/(tabs)/Community/Crew/crewBoard',
                params: {
                  id: firstCrew.id,
                  name: firstCrew.name,
                  members: firstCrew.members.toString(),
                },
              });
            }}
          >
            <Text style={[styles.tabText, activeTab === '게시판' && styles.activeTabText]}>
              게시판
            </Text>
            {activeTab === '게시판' && <View style={styles.underline} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === '채팅' && styles.activeTab]}
            onPress={() => {
              setActiveTab('채팅');
              router.push({
                pathname: '/(tabs)/Community/Crew/crewChat',
                params: {
                  id: id || dummyCrews[0].id,
                  name: name || dummyCrews[0].name,
                  members: members || dummyCrews[0].members.toString(),
                },
              });
            }}
          >
            <Text style={[styles.tabText, activeTab === '채팅' && styles.activeTabText]}>
              채팅
            </Text>
            {activeTab === '채팅' && <View style={styles.underline} />}
          </TouchableOpacity>
        </View>

        {/* 스크롤 가능한 내용 */}
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          nestedScrollEnabled={true} // 중첩 스크롤 활성화
          showsVerticalScrollIndicator={true} // 스크롤바 표시
          keyboardShouldPersistTaps="handled" // SearchBar 클릭 시 스크롤 유지
        >
          <SearchBar value={text} onChangeText={setText} />
          <View>
            <Text style={styles.sectionHeader}>나의 모임</Text>
            {filteredCrews.filter(crew => crew.isMyCrew).length === 0 ? (
              <Text style={styles.emptyText}>신청한 모임이 없습니다.</Text>
            ) : (
              filteredCrews
                .filter(crew => crew.isMyCrew)
                .map((item) => renderCrewItem(item))
            )}
          </View>
          <View>
            <Text style={styles.sectionHeader}>예정 모임</Text>
            {filteredCrews.length === 0 ? (
              <Text style={styles.emptyText}>예정된 모임이 없습니다.</Text>
            ) : (
              filteredCrews.map((item) => renderCrewItem(item))
            )}
          </View>
        </ScrollView>
      </View>
    </ThemedView>
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, // Increase padding for Android
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
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
  scrollViewContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
    color: '#000',
  },
  crewListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#d9d9d9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    fontSize: 12,
    color: '#444',
  },
  crewDetails: {
    flex: 1,
    marginLeft: 12,
  },
  crewName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  crewMembers: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  joinButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});