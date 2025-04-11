import React from 'react';
import { Stack } from 'expo-router';

const RunningLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // 모든 화면에서 헤더 숨김
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="freeRun" />
      <Stack.Screen name="courseRun/index" />
      <Stack.Screen name="courseRun/courseRunMap" />
    </Stack>
  );
};

export default RunningLayout;