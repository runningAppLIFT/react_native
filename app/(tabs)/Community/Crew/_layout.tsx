import React from 'react';
import { Stack } from 'expo-router';

const CommunityLayout = () => {
  return (
    <Stack
         screenOptions={{
           headerShown: false, // 헤더를 숨깁니다.
         }}
       >
       <Stack.Screen name="index" options={{ title: 'addcrew' }} />
    </Stack>
  );
};

export default CommunityLayout;