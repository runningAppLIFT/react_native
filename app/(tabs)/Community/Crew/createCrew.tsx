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
import { launchImageLibrary } from 'react-native-image-picker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function CreateCrew() {
  const [regionsList, setRegionsList] = useState([]);
  const [leader, setLeader] = useState('');
  const [crewMembers, setCrewMembers] = useState([]);
  const [crewName, setCrewName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [keywordsList, setKeywordsList] = useState([]);
  const [maxCrewMembers, setMaxCrewMembers] = useState(''); // Maximum crew members

  // 키워드 선택지
  const keywordOptions = ['운동', '음악', '여행', '게임', '요리'];
  // 지역 선택지
  const regionOptions = ['서울', '부산', '대구', '인천', '광주'];

  // 이미지 선택
  const handleImagePicker = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });
    if (result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  // 크루 키워드 토글
  const toggleKeyword = (keyword) => {
    if (keywordsList.includes(keyword)) {
      setKeywordsList((prev) => prev.filter((item) => item !== keyword));
    } else if (keywordsList.length < 5) {
      setKeywordsList((prev) => [...prev, keyword]);
    }
  };

  // 지역 토글
  const toggleRegion = (region) => {
    if (regionsList.includes(region)) {
      setRegionsList((prev) => prev.filter((item) => item !== region));
    } else if (regionsList.length < 3) {
      setRegionsList((prev) => [...prev, region]);
    }
  };

  // 함께할 크루 추가
  const handleCrewMemberSubmit = () => {
    if (leader.trim() && !crewMembers.includes(leader.trim())) {
      setCrewMembers((prev) => [...prev, leader.trim()]);
      setLeader('');
    }
  };

  // 함께할 크루 제거
  const removeCrewMember = (member) => {
    setCrewMembers((prev) => prev.filter((item) => item !== member));
  };

  // 폼 제출
  const handleSubmit = () => {
    console.log({
      regions: regionsList,
      crewMembers,
      crewName,
      description,
      imageUri,
      keywords: keywordsList,
      maxCrewMembers: maxCrewMembers ? parseInt(maxCrewMembers) : null,
    });
    alert('크루 생성 완료!');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.contentContainer, { paddingBottom: 100 }]}>
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
          <Text style={styles.label}>크루 운영진</Text>
          <Text style={styles.smallText}>*본인포함, 최소 3명 이상 운영자가 필요합니다.</Text>
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
          <Text style={styles.label}>크루 최대 인원수</Text>
          <TextInput
            style={styles.input}
            value={maxCrewMembers}
            onChangeText={(text) => setMaxCrewMembers(text.replace(/[^0-9]/g, ''))}
            placeholder="최대 인원수를 입력하세요 (숫자)"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        {/* 크루 활동 지역 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>크루 활동 지역 (최대 3개)</Text>
          <View style={styles.buttonContainer}>
            {regionOptions.map((region, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  regionsList.includes(region) && styles.selectedButton,
                  !regionsList.includes(region) &&
                    regionsList.length >= 3 &&
                    styles.disabledButton,
                ]}
                onPress={() => toggleRegion(region)}
                disabled={!regionsList.includes(region) && regionsList.length >= 3}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    regionsList.includes(region) && styles.selectedButtonText,
                  ]}
                >
                  {region}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 크루 키워드 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>크루 키워드 설정 (최대 5개)</Text>
          <View style={styles.buttonContainer}>
            {keywordOptions.map((keyword, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  keywordsList.includes(keyword) && styles.selectedButton,
                  !keywordsList.includes(keyword) &&
                    keywordsList.length >= 5 &&
                    styles.disabledButton,
                ]}
                onPress={() => toggleKeyword(keyword)}
                disabled={!keywordsList.includes(keyword) && keywordsList.length >= 5}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    keywordsList.includes(keyword) && styles.selectedButtonText,
                  ]}
                >
                  {keyword}
                </Text>
              </TouchableOpacity>
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
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EEE',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#333',
  },
  selectedButtonText: {
    color: '#fff',
  },
  addButton: {
    marginLeft: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    color: '#fff',
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 12,
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