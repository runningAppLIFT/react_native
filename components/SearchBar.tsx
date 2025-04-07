import { StyleSheet, TextInput, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText, placeholder }) => {
  return (
    <View style={styles.container}>
      <IconSymbol name="a.magnify" color="#000" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder || '게시판 제목 검색'}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    margin: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    alignItems: 'center',
  },
  icon: {
    margin: 10,
  },
  input: {
    flex: 1,
    padding: 10,
  },
});
