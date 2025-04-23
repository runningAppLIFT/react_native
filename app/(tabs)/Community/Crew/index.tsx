import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import Animated from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SearchBar } from '@/components/SearchBar';
import { useCrew } from '@/hooks/crew/useCrews'; 
import { useAuth } from '@/hooks/authContext';

type Crew = {
  id: string;
  name: string;
  members: number;
};

export default function Crew() {
  const [text, setText] = useState('');
  const [searchResults, setSearchResults] = useState<Crew[]>([]);
  const router = useRouter();
  const { user } = useAuth();
  const { allCrews, myCrews, loading, error } = useCrew(user?.userId);

  const onGestureEvent = ({ nativeEvent }: { nativeEvent: { translationX: number } }) => {
    if (nativeEvent.translationX < 150) {
      router.push('/(tabs)/Community');
    }
  };

  const filteredCrews = (crews: Crew[]) =>
    crews.filter((crew) => crew.name.toLowerCase().includes(text.toLowerCase()));

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

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </ThemedView>
    );
  }

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
                if (!user) {
                  router.push('/login');
                  return;
                }
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
              {!user ? (
                <Text style={styles.emptyText}>로그인이 필요합니다.</Text>
              ) : !Array.isArray(myCrews) || myCrews.length === 0 ? (
                <Text style={styles.emptyText}>가입한 크루가 없습니다.</Text>
              ) : (
                filteredCrews(myCrews).map((item) => renderCrewItem(item, true))
              )}
            </View>

            <View>
              <Text style={styles.sectionHeader}>크루 목록</Text>
              {!Array.isArray(allCrews) || allCrews.length === 0 ? (
                <Text style={styles.emptyText}>크루 목록이 없습니다.</Text>
              ) : (
                filteredCrews(allCrews).map((item) => renderCrewItem(item, true))
              )}
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  btnPlus: {
    position: 'absolute',
    right: 16,
    top: 8,
  },
  btnPlusText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
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
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
    marginTop: 20,
  },
});