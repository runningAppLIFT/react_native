import { StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useState } from 'react';

// Dummy data for crews
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
    name: '홍대 보드게임 크루',
    members: 12,
    description: '보드게임 카페에서 정기적으로 모이는 모임입니다.',
    isMyCrew: false,
    isUpcoming: true,
  },
];

export default function CrewIntro() {
  const { id, name, members } = useLocalSearchParams(); // Get params passed from navigation
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false); // 모달 상태 관리
  const [activeTab, setActiveTab] = useState('소개'); // Track active tab

  return (
    <ThemedView style={styles.container}>
      {/* 상단 헤더 (기존 디자인 유지) */}
      <View style={styles.headerImageContainer}>
        <ThemedText type="title" style={styles.headerTitle}>
          크루
        </ThemedText>
      </View>

      {/* 크루 소개 내용 */}
      <View style={styles.contentContainer}>
        {/* 페이지 이동 버튼들 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === '소개' && styles.activeTab]}
            onPress={() => {
              setActiveTab('소개');
              // Stay on CrewIntro with current crew data
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
              router.push('/(tabs)/Community/Crew/gathering');
            }}
          >
            <Text style={[styles.tabText, activeTab === '모임' && styles.activeTabText]}>
              모임
            </Text>
            {activeTab === '모임' && <View style={styles.underline} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabButton}>
            <Text style={styles.tabText}>게시판</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabButton}>
            <Text style={styles.tabText}>채팅</Text>
          </TouchableOpacity>
        </View>

        {/* 이미지 플레이스홀더 */}
        <View style={styles.imageContainer}>
          <Text style={styles.imagePlaceholder}>사진</Text>
        </View>

        {/* 크루 이름과 참여 인원 */}
        <ThemedText style={styles.crewName}>{name}</ThemedText>
        <Text style={styles.crewMembers}>{`${members}명 참여`}</Text>

        {/* 크루 설명 */}
        <Text style={styles.description}>
          우리는 매일 아침 6시에 여의도공원에서 라닝을 시작합니다. 주말 이
          없는 바쁜 일상 속에서 아침 라닝으로 하루를 시작하며, 함께 뛰는
          즐거움을 느낍니다. 규칙적이고 건강한 생활을 위해, 우리와 함께
          아침을 열어 보세요!{'\n\n'}
        </Text>

        {/* 크루 가입하기 버튼 */}
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => setModalVisible(true)} // 모달창 열기
        >
          <Text style={styles.joinButtonText}>크루 가입하기</Text>
        </TouchableOpacity>
      </View>

      {/* 모달창 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>가입하시겠습니까?</Text>
            <Text style={styles.modalMessage}>
              {name} 크루에 가입하시겠습니까?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)} // 취소 버튼
              >
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  setModalVisible(false); // 모달 닫기
                  alert(`"${name}" 가입했습니다`); // 가입 확인 메시지
                }}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  확인
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingBottom: 20,
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
  imageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#d9d9d9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 16,
  },
  imagePlaceholder: {
    fontSize: 16,
    color: '#444',
  },
  crewName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  crewMembers: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    marginBottom: 20,
  },
  joinButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});