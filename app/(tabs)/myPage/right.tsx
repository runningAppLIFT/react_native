import { router } from 'expo-router';
import React, { useEffect, useCallback } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, Platform, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useMyPosts, Post } from '@/hooks/community/useMyPosts'; // useMyPosts로 변경
import { useAuth } from '@/hooks/authContext';

export default function MyPageRight() {
  const { posts, isLoading, error, loadInitialPosts, loadMore, pageInfo } = useMyPosts();
  const { user } = useAuth();

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialPosts();
  }, [loadInitialPosts]);

  // 화면 포커스 시 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      loadInitialPosts();
    }, [loadInitialPosts])
  );

  // 제스처 이벤트 (오른쪽 스와이프 시 다른 페이지로 이동)
  const onGestureEvent = ({ nativeEvent }: { nativeEvent: { translationX: number } }) => {
    if (nativeEvent.translationX > 150) {
      router.push('/(tabs)/myPage');
    }
  };

// 게시글 렌더링
const renderItem = ({ item }: { item: Post }) => (
  <TouchableOpacity
    style={styles.postContainer}
    onPress={() =>
      router.push({
        pathname: '/(tabs)/Community/postDetail',
        params: { 
          post: JSON.stringify(item),
          previousScreen: '/(tabs)/myPage/right' // 이전 화면 경로 추가
        },
      })
    }
  >
    <ThemedText type="subtitle" numberOfLines={1} ellipsizeMode="tail">
      {item.comm_title}
    </ThemedText>
    <ThemedText numberOfLines={1} ellipsizeMode="tail">
      {item.comm_detail}
    </ThemedText>
    <ThemedView style={styles.contentinner}>
      <ThemedView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF7FF' }}>
        <Text style={{ marginRight: 10 }}>작성자 {user?.nickname || item.user_id}</Text>
        <Text>{new Date(item.created_at).toLocaleDateString()}</Text>
      </ThemedView>
      <ThemedView style={styles.likeContainer}>
        <IconSymbol name="message" color="#000" />
        <Text>{item.commentCount}</Text>
      </ThemedView>
    </ThemedView>
  </TouchableOpacity>
);

  // ListFooterComponent: 스크롤 끝에서의 UI
  const renderFooter = () => {
    if (isLoading) {
      return (
        <ThemedView style={styles.footerContainer}>
          <ActivityIndicator size="small" color="#0066FF" />
          <Text style={styles.footerText}>로딩 중...</Text>
        </ThemedView>
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
        <ThemedView style={styles.footerContainer}>
          <Text style={styles.footerText}>마지막 게시물입니다.</Text>
        </ThemedView>
      );
    }
    return null;
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      activeOffsetX={[-10, 10]}
    >
      <Animated.View style={{ flex: 1 }}>
        <ThemedView style={styles.container}>
          {/* 헤더 */}
          <ThemedView style={styles.headerImageContainer}>
            <ThemedText type="title" style={styles.headerText}>내 작성글 조회</ThemedText>
          </ThemedView>

          {/* 게시글 리스트 */}
          {error && (
            <ThemedView style={styles.footerContainer}>
              <Text style={[styles.statusText, { color: 'red' }]}>{error}</Text>
              <TouchableOpacity onPress={loadInitialPosts}>
                <Text style={[styles.footerText, { color: '#0066FF' }]}>재시도</Text>
              </TouchableOpacity>
            </ThemedView>
          )}
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
            onEndReached={() => pageInfo.hasNextPage && loadMore()}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={loadInitialPosts} />
            }
          />
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
    backgroundColor: '#EEF7FF'
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