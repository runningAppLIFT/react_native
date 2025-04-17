import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import Swiper from 'react-native-swiper';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useNavigation } from '@react-navigation/native';
import { SearchBar } from '@/components/SearchBar';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

type Crew = {
  id: string;
  name: string;
  members: number;

};

const initialCrews: Crew[] = [
  { id: '1', name: '아침 러닝 크루',  members: 15 },
  { id: '2', name: '주말 산책 크루',  members: 22  },
  { id: '3', name: '밤 러닝 크루', members: 9 },
];

export default function Crew() {
  const [crews, setCrews] = useState<Crew[]>(initialCrews);
  const [text, setText] = useState('');

   const router = useRouter();

   const onGestureEvent = ({ nativeEvent }: { nativeEvent: { translationX: number } }) => {
    if (nativeEvent.translationX < -150) {
      router.push('/(tabs)/Community');
    }
  };

  const filteredCrews = crews.filter(crew =>
    crew.name.toLowerCase().includes(text.toLowerCase())
  );

  const renderItem = ({ item }: { item: Crew }) => (
    <TouchableOpacity  style={styles.crewContainer}>
      <ThemedView >
        <Text style={styles.images}>image</Text>
      </ThemedView>
      <ThemedText style={styles.crewtext}>{item.name}</ThemedText>
      <View style={styles.crewInfo}>
          {/* <IconSymbol name="thumb-up-off-alt"  color="#000" /> */}
        <Text style={{marginLeft:8}}>{item.members}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent}>
       <Animated.View style={{ flex: 1 }}>
    <ThemedView style={styles.container}>
      {/* 상단 헤더 영역 */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>크루</ThemedText>
        {/* 필요 시 크루 생성 버튼 추가 */}
        <TouchableOpacity style={styles.btnPlus} onPress={() => {/* 크루 생성 기능 구현 */}}>
          <Text style={styles.btnPlusText}>+</Text>
        </TouchableOpacity>
      </View>
      <SearchBar value={text} onChangeText={setText} />
      <View>
      <Text style={styles.crewheader}>나의 크루</Text>

      {initialCrews.length === 0 ? (
               <Text style={styles.emptyText}>
                가입한 크루가 없습니다 
               {"\n"}친구들과 함께 크루를 만들거나
               {"\n"}
               </Text>
             ) : ( 
      <FlatList
       key={'grid'}
        data={filteredCrews}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        />)}
      </View>

      <Text style={styles.crewheader}>크루 목록</Text>
      <FlatList
       key={'grid'}
        data={filteredCrews}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity style={styles.circleButton} onPress={() => {/* navigation.navigate('AddCrew') */ }}>
        <Text style={styles.circleButtonText}>+</Text>
      </TouchableOpacity>
    </ThemedView>
    </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 100,
    backgroundColor: '#A1CEDC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  btnPlus: {
    padding: 4,
  },
  btnPlusText: {
    fontSize: 54,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  crewContainer: {
    marginBottom: 12,
    padding: 12,
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
  },

  crewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,

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

  images:{
    backgroundColor: '#f5f5f5', 
    width:150,
    height:80 ,   
    borderRadius: 10,
  },
  crewtext:{
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#000',
  },
  crewheader:{
    fontSize: 26,
    fontWeight: 'bold',
    marginLeft: 28,
    marginTop: 8,
    color: '#000',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'left',
    marginLeft: 28,
    marginTop: 20,
    paddingBottom: 12,
  },
});
