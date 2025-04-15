import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import Swiper from 'react-native-swiper';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useNavigation } from '@react-navigation/native';
import { SearchBar } from '@/components/SearchBar';


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
  { id: '1', title: '첫 번째 게시글', content: '이것은 첫 번째 게시글의 내용입니다.' ,name:'러닝광',time:1,like: 2,comment: 4}, 
  { id: '2', title: '두 번째 게시글', content: '이것은 두 번째 게시글의 내용입니다.' ,name:'러닝광',time:2,like: 4,comment: 2},
  { id: '3', title: '세 번째 게시글', content: '이것은 세 번째 게시글의 내용입니다.' ,name:'러닝광',time:3,like: 1,comment: 1},
];

export default function Community() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [text, setText] = useState('');

 const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(text.toLowerCase())
  );

  const renderItem = ({ item }: { item: Post }) => (
    <TouchableOpacity style={styles.postContainer}> 
        <ThemedText type="subtitle">{item.title}</ThemedText>
        <ThemedText >{item.content}</ThemedText>
        <View style={styles.contentinner}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{marginRight: 10}}>{item.name}</Text>
          <Text>{`${item.time}시간 전`}</Text>
        </View>
        <View style={styles.likeContainer}>
        <IconSymbol name="thumb-up-off-alt"  color="#000" />
        <Text style={{marginRight: 10}}>{`${item.like}`}</Text> 
        <IconSymbol name="chat-bubble-outline"  color="#000"/>
        <Text>{`${item.comment}`}</Text>  
        </View>
      </View>
    </TouchableOpacity>
  );

const navigation = useNavigation();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerImageContainer}>
        <ThemedText type="title" style={styles.headerText}>자유게시판</ThemedText>
        <TouchableOpacity style={styles.btnplus} onPress={() => {/* 게시물 작성 기능 구현 */}}>
        <Text style={styles.btnplustext}>+</Text> 
        </TouchableOpacity>
      </ThemedView>

      <SearchBar value={text} onChangeText={setText} />

        <ThemedView style={styles.noticeContainer}>
  <ThemedText style={styles.noticeTop}>공지사항</ThemedText>

  {/* <TouchableOpacity onPress={() => navigation.push('details/noticeDetail', { id: notice.id })}> */}
  <View style={styles.notice} >
    <Swiper
      autoplay
      autoplayTimeout={4}
      showsPagination={true} 
      dotColor="lightgray"  
      activeDotColor="black"
      dotStyle={{ width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 }}
      activeDotStyle={{ width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 }} 
      height={60} // 슬라이드 높이
      paginationStyle={{ bottom: -10 }}
    >
      <TouchableOpacity>
        <ThemedText style={styles.noticetitle}>게시판 이용 안내사항</ThemedText>
        <ThemedText>2025.03.28</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity>
        <ThemedText style={styles.noticetitle}>새로운 기능이 추가되었습니다</ThemedText>
        <ThemedText>2025.03.30</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity>
        <ThemedText style={styles.noticetitle}>점검 안내: 4월 1일 새벽 2시</ThemedText>
        <ThemedText>2025.03.31</ThemedText>
      </TouchableOpacity>
    </Swiper>
  </View>
  </ThemedView>
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.boardContainer}
      />

      <TouchableOpacity style={styles.circleButton} onPress={() => navigation.navigate('AddPost')}>
        <Text style={styles.circlebtntext}>+</Text>
      </TouchableOpacity>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerImageContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#A3BFFA',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginLeft: 14,
  },
  boardContainer: {
    padding: 16,

  },
  postContainer: {
    padding: 16,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  webview: {
    flex:1
  },
  btnplus:{
    position: 'absolute',
    right: 20,
    top: 10,
    
  },

  btnplustext:{
    fontSize:54,
    fontWeight: 'bold',
    color: '#fff'
  },

  inputContainer: {
    flexDirection: 'row',
    margin: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,  
  },
  noticeContainer:{
    margin: 10,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,  
   
  },
  notice:{
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noticeTop:{
    padding: 10,
    textAlign: 'center',
    backgroundColor: '#2990FF',
    fontSize:20,
    fontWeight: 'bold',
    color: '#fff',
    borderRadius: 10,
  },
  noticetitle:{
    fontSize:16,
    fontWeight: 'bold',
  },  
  contentinner:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#B3B3B3',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
  },
  likeContainer :{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 10,
    borderRadius: 10,
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
  circlebtntext: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
  },
});