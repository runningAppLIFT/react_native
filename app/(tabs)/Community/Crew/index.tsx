import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import Animated from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SearchBar } from '@/components/SearchBar';

type Crew = {
  id: string;
  name: string;
  members: number;
};

const initialCrews: Crew[] = [
  { id: '1', name: '아침 러닝 크루', members: 15 },
  { id: '2', name: '주말 산책 크루', members: 22 },
  { id: '3', name: '밤 러닝 크루', members: 9 },
];

export default function Crew() {
  const [crews, setCrews] = useState<Crew[]>(initialCrews);
  const [text, setText] = useState('');
  const router = useRouter();

  const onGestureEvent = ({ nativeEvent }: { nativeEvent: { translationX: number } }) => {
    if (nativeEvent.translationX < 150) {
      router.push('/(tabs)/Community');
    }
  };

  const filteredCrews = crews.filter((crew) =>
    crew.name.toLowerCase().includes(text.toLowerCase())
  );

  const renderCrewItem = (item: Crew, isCrewList: boolean = false) => (
    <TouchableOpacity
      style={styles.crewListItem}
      key={item.id}
      onPress={() => {
        if (isCrewList) {
          router.push({
            pathname: '/(tabs)/Community/Crew/crewIntro',
            params: { id: item.id, name: item.name, members: item.members },
          });
        }
      }}
    >
      <View style={styles.imageContainer}>
        <Text style={styles.imagePlaceholder}>image</Text>
      </View>
      <View style={styles.crewDetails}>
        <ThemedText style={styles.crewName}>{item.name}</ThemedText>
        <Text style={styles.crewMembers}>{`${item.members}명 참여`}</Text>
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
            <TouchableOpacity
              style={styles.btnPlus}
              onPress={() => {
                router.push('/(tabs)/Community/Crew/createCrew');
              }}
            >
              <Text style={styles.btnPlusText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* 전체 스크롤 가능한 내용 */}
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <SearchBar value={text} onChangeText={setText} />

            <View>
              <Text style={styles.sectionHeader}>나의 크루</Text>
              {initialCrews.length === 0 ? (
                <Text style={styles.emptyText}>가입한 크루가 없습니다.</Text>
              ) : (
                filteredCrews.map((item) => renderCrewItem(item, true))
              )}
            </View>

            <View>
              <Text style={styles.sectionHeader}>크루 목록</Text>
              {filteredCrews.map((item) => renderCrewItem(item, true))}
            </View>
          </ScrollView>
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
    backgroundColor: '#0066FF', // 모던한 파란색
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  btnPlus: {
    position: 'absolute', // 절대 위치 설정
    right: 16, // 오른쪽 여백
    top: 8, // 위쪽 여백
  },
  btnPlusText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 80, // 아래 버튼 여백
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
  sectionHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
    color: '#000',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  circleButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  circleButtonText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
  },
});
