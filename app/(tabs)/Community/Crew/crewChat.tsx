import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useState, useRef, useEffect } from 'react';

// 더미 데이터 (변경 없음)
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

const dummyMessages = [
  {
    id: '1',
    sender: 'User1',
    content: '안녕하세요! 내일 러닝 모임 몇 시에 시작하나요?',
    timestamp: '2025-04-17 10:00',
    isSent: false,
  },
  {
    id: '2',
    sender: 'You',
    content: '내일 아침 6시에 여의도공원에서 시작합니다!',
    timestamp: '2025-04-17 10:02',
    isSent: true,
  },
  {
    id: '3',
    sender: 'User2',
    content: '좋아요, 저도 참석할게요!',
    timestamp: '2025-04-17 10:05',
    isSent: false,
  },
];

type Message = {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isSent: boolean;
};

export default function CrewChat() {
  const { id, name, members } = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('채팅');
  const [messages, setMessages] = useState<Message[]>(dummyMessages);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // 메시지가 추가될 때 하단으로 스크롤
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToIndex({
        index: messages.length - 1,
        animated: true,
        viewOffset: 100, // 최신 메시지와 입력창 사이의 간격
      });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: (messages.length + 1).toString(),
        sender: 'You',
        content: newMessage,
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        isSent: true,
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    }
  };

  // getItemLayout 구현 (아이템 높이 추정)
  const getItemLayout = (data: Message[] | null | undefined, index: number) => ({
    length: 80, // 각 메시지 아이템의 예상 높이 (조정 가능)
    offset: 80 * index,
    index,
  });

  // 스크롤 실패 시 대체 동작
  const onScrollToIndexFailed = (info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isSent ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      <Text style={styles.senderText}>{item.sender}</Text>
      <Text style={styles.messageText}>{item.content}</Text>
      <Text style={styles.timestampText}>{item.timestamp}</Text>
    </View>
  );

  return (
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
            router.push({
              pathname: '/(tabs)/Community/Crew/gathering',
              params: {
                id: id || dummyCrews[0].id,
                name: name || dummyCrews[0].name,
                members: members || dummyCrews[0].members.toString(),
              },
            });
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
              pathname: '/(tabs)/Community/Crew/crewBoard',
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

      {/* 채팅 컨텐츠 */}
      <ThemedView style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          getItemLayout={getItemLayout} // 아이템 레이아웃 제공
          onScrollToIndexFailed={onScrollToIndexFailed} // 스크롤 실패 처리
          onContentSizeChange={() => {
            if (flatListRef.current && messages.length > 0) {
              flatListRef.current.scrollToIndex({
                index: messages.length - 1,
                animated: true,
                viewOffset: 100, // 초기 렌더링 시 오프셋
              });
            }
          }}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Text style={styles.sendButtonText}>보내기</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
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
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 160 : 160,
  },
  messageList: {
    flexGrow: 1,
    paddingVertical: 10,
    paddingBottom: 20, // 입력창과의 간격
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  sentMessage: {
    backgroundColor: '#0066FF',
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    backgroundColor: '#E0E0E0',
    alignSelf: 'flex-start',
  },
  senderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 14,
    color: '#000',
  },
  timestampText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 80 : 80,
    left: 16,
    right: 16,
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 10,
    color: '#000',
  },
  sendButton: {
    backgroundColor: '#0066FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});