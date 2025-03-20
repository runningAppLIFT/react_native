import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
// import {WebView} from 'react-native-webview'

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

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const renderItem = ({ item }: { item: Post }) => (
    <TouchableOpacity style={styles.postContainer}>
      <ThemedText type="subtitle">{item.title}</ThemedText>
      <ThemedText>{item.content}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {/* <WebView
      source = {{url : "https://react-jeonghh-88013499747.asia-northeast2.run.app"}}
      style={styles.webview}
      /> */}
      <ThemedView style={styles.headerImageContainer}>
        <ThemedText type="title" style={styles.headerText}>게시판</ThemedText>
      </ThemedView>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.boardContainer}
      />
      
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
  }
});