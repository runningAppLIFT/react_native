import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Text } from 'react-native';

type Post = {
  id: string;
  title: string;
  content: string;
};

const initialPosts: Post[] = [
  { id: '1', title: '첫 번째 게시글', content: '이것은 첫 번째 게시글의 내용입니다.' },
  { id: '2', title: '두 번째 게시글', content: '이것은 두 번째 게시글의 내용입니다.' },
  { id: '3', title: '세 번째 게시글', content: '이것은 세 번째 게시글의 내용입니다.' },
];

export default function MypageScreen() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const renderItem = ({ item }: { item: Post }) => (
    <TouchableOpacity style={styles.postContainer}>
      <ThemedText type="subtitle">{item.title}</ThemedText>
      <ThemedText>{item.content}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerImageContainer}>
        <ThemedText type="title" style={styles.headerText}>마이 페이지</ThemedText>
      </ThemedView>
      <ThemedView style={styles.myPageContainer}> 
          <TouchableOpacity onPress={() => {/* 내 정보 수정 기능 구현 */}}>
            <Text style={styles.textStyle}>내 정보</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {/* 내 코스 관리 기능 구현 */}}>
            <Text style={styles.textStyle}>내 코스관리</Text>
          </TouchableOpacity>  
          <TouchableOpacity onPress={() => {/* 내 작성글 관리 기능 구현 */}}>
            <Text style={styles.textStyle}>내 작성글 관리</Text>
          </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerImageContainer: {
    height: 130,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#A1CEDC',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  myPageContainer: {
    flex: 1,
    padding: 25,
    
    

  },
  textStyle: {
    marginBottom: 24,
    fontSize: 24,
    padding: 20, 
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    backgroundColor: '#eee',
    borderRadius: 10,
  },
  postContainer: {
    padding: 16,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  webview: {
    flex:1
  }
});