import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker'; // 이미지 선택 라이브러리
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function CreateCrew() {
  const [region, setRegion] = useState('');
  const [leader, setLeader] = useState(''); // 현재 입력 중인 크루
  const [crewMembers, setCrewMembers] = useState([]); // 추가된 크루 리스트
  const [crewName, setCrewName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [crewKeywords, setCrewKeywords] = useState('');
  const [keywordsList, setKeywordsList] = useState([]); // 입력된 키워드 리스트

  // 이미지 선택
  const handleImagePicker = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });
    if (result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri); // 이미지 URI 설정
    }
  };

  // 크루 키워드 추가
  const handleKeywordSubmit = () => {
    if (crewKeywords.trim() && !keywordsList.includes(crewKeywords.trim())) {
      setKeywordsList((prev) => [...prev, crewKeywords.trim()]); // 중복 방지 및 추가
      setCrewKeywords(''); // 입력 필드 초기화
    }
  };

  // 함께할 크루 추가
  const handleCrewMemberSubmit = () => {
    if (leader.trim() && !crewMembers.includes(leader.trim())) {
      setCrewMembers((prev) => [...prev, leader.trim()]); // 중복 방지 및 추가
      setLeader(''); // 입력 필드 초기화
    }
  };

  // 크루 키워드 제거
  const removeKeyword = (keyword) => {
    setKeywordsList((prev) => prev.filter((item) => item !== keyword)); // 키워드 삭제
  };

  // 함께할 크루 제거
  const removeCrewMember = (member) => {
    setCrewMembers((prev) => prev.filter((item) => item !== member)); // 크루 제거
  };

  // 폼 제출
  const handleSubmit = () => {
    console.log({
      region,
      crewMembers, // 함께할 크루 리스트
      crewName,
      description,
      imageUri,
      keywords: keywordsList, // 입력된 키워드 리스트
    });
    alert('크루 생성 완료!');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.contentContainer, {paddingBottom: 100}]}>
        {/* 페이지 타이틀 */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerText}>
            크루 생성
          </ThemedText>
        </View>

        {/* 이미지 등록 */}
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={handleImagePicker} style={styles.imageButton}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <Text style={styles.imagePlaceholder}>+ 이미지 추가</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 크루 이름 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>크루 이름</Text>
          <TextInput
            style={styles.input}
            value={crewName}
            onChangeText={setCrewName}
            placeholder="크루 이름을 입력하세요"
            placeholderTextColor="#999"
          />
        </View>

        {/* 함께할 크루 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>함께할 크루</Text>
          <Text style={styles.smallText}>* 최대 2명까지 추가 가능합니다.</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={leader}
              onChangeText={setLeader}
              placeholder="크루명을 입력하세요"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleCrewMemberSubmit}>
              <Text style={styles.addButtonText}>추가</Text>
            </TouchableOpacity>
          </View>
          {/* 함께할 크루 리스트 */}
          <View style={styles.keywordsContainer}>
            {crewMembers.map((member, index) => (
              <View style={styles.keywordItem} key={index}>
                <Text style={styles.keywordText}>{member}</Text>
                <TouchableOpacity onPress={() => removeCrewMember(member)}>
                  <Text style={styles.removeText}>ⓧ</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* 크루 활동 지역 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>크루 활동 지역</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={region}
              onChangeText={setRegion}
              placeholder="지역을 입력하세요"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.searchButton}>
              <Text style={styles.searchButtonText}>검색</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 크루 키워드 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>크루 키워드 설정</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={crewKeywords}
              onChangeText={setCrewKeywords}
              placeholder="키워드를 입력하세요"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleKeywordSubmit}>
              <Text style={styles.addButtonText}>추가</Text>
            </TouchableOpacity>
          </View>
          {/* 입력된 키워드 리스트 */}
          <View style={styles.keywordsContainer}>
            {keywordsList.map((keyword, index) => (
              <View style={styles.keywordItem} key={index}>
                <Text style={styles.keywordText}>{keyword}</Text>
                <TouchableOpacity onPress={() => removeKeyword(keyword)}>
                  <Text style={styles.removeText}>ⓧ</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* 크루 설명 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>크루 설명</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            placeholder="크루에 대해 설명해주세요"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* 크루 생성하기 버튼 */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>크루 생성하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    fontSize: 14,
    color: '#999',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#444',
    fontWeight: '500',
  },
  smallText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    fontSize: 14,
    color: '#333',
  },
  searchButton: {
    marginLeft: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 14,
    color: '#fff',
  },
  addButton: {
    marginLeft: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: '#fff',
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  keywordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  keywordText: {
    fontSize: 14,
    color: '#333',
    marginRight: 6,
  },
  removeText: {
    fontSize: 12,
    color: '#FF3B30',
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
