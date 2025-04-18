import { router } from 'expo-router';
import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';

const onGestureEvent = ({ nativeEvent }: { nativeEvent: { translationX: number } }) => {
  if (nativeEvent.translationX > 150) {
    router.push('/(tabs)/myPage');
  }
};


export default function MyPageRight() {
  return (
    <PanGestureHandler onGestureEvent={onGestureEvent}>
    <Animated.View style={{ flex: 1 }}>
    <View style={styles.container}>
      <Text style={styles.text}>내 작성글 조회 페이지</Text>
    </View>
    </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
