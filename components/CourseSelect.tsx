import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function CourseSelect() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>어떤 코스로 안내해드릴까요?</Text>

      <TouchableOpacity style={styles.savedButton}>
        <Text style={styles.buttonText}>내 저장코스</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.nearbyButton}>
        <Text style={styles.buttonText}>주변코스 탐색</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white',
  },
  title: {
    fontSize: 18, textAlign: 'center',
  },
  savedButton: {
    position: 'absolute', bottom: 20, right: 20,
    width: 160, height: 50, borderRadius: 10, backgroundColor: '#007AFF',
    justifyContent: 'center', alignItems: 'center',
  },
  nearbyButton: {
    position: 'absolute', bottom: 90, right: 20,
    width: 160, height: 50, borderRadius: 10, backgroundColor: '#007AFF',
    justifyContent: 'center', alignItems: 'center',
  },
  buttonText: {
    color: 'white', fontSize: 16, fontWeight: 'bold',
  },
});
