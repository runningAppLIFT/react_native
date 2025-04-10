import { RouteProp, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';

type notice = {
  id: number;
  title: string;
  date: string;
  content: string;
}

// 공지사항 데이터 (임시)
const notices = [
  { id: 1, title: '게시판 이용 안내사항', date: '2025.03.28', content: '게시판 이용 방법과 규칙에 대해 안내드립니다.' },
  { id: 2, title: '새로운 기능 추가 안내', date: '2025.03.30', content: '새로운 기능이 추가되었습니다. 자세한 내용을 확인하세요.' },
  { id: 3, title: '시스템 점검 공지', date: '2025.04.01', content: '시스템 점검으로 인해 서비스 이용이 일시적으로 중단됩니다.' },
];

export default function PostDetail() {
  const route = useRoute<RouteProp<{ PostDetail: { id: number } }, 'PostDetail'>>();
  const { id } = route.params || {}; // 🔥 전달된 공지사항 ID 가져오기
  const notice = notices.find((item) => item.id === id); // 해당 공지 데이터 찾기

  if (!notice) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>공지사항을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{notice.title}</Text>
      <Text style={styles.date}>{notice.date}</Text>
      <Text style={styles.content}>{notice.content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  date: { fontSize: 14, color: 'gray', marginBottom: 10 },
  content: { fontSize: 16, lineHeight: 24 },
});
