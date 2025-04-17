import React from 'react';
import { Stack } from 'expo-router';

const CommunityLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // 헤더를 숨깁니다.
        animation: 'none', // 모든 화면 전환에서 애니메이션 비활성화
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="createCrew" options={{ title: 'addcrew' }} />
      <Stack.Screen name="crewIntro" options={{ title: 'crewIntro' }} />
      <Stack.Screen name="gathering" options={{ title: 'gathering' }} />
      <Stack.Screen name="crewChat" options={{ title: 'crewChat' }} />
    </Stack>
  );
};

export default CommunityLayout;