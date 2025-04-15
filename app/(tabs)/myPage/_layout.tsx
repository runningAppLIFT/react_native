import React from 'react';
import { Stack } from 'expo-router';

const MyPageLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // 헤더를 숨깁니다.
        gestureEnabled: true, // 스와이프 제스처를 활성화합니다.
        gestureDirection: 'horizontal', // 수평 스와이프 방향을 지정합니다.
        gestureResponseDistance: 300, // 스와이프 감도 (시뮬레이터에서 테스트 용이)
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0], // 이전 → 현재 화면 이동 애니메이션
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      {/* index (기준 화면) */}
      <Stack.Screen name="index" options={{ title: 'MyPage Main' }} />

      {/* 오른쪽으로 스와이프하면 이동할 페이지 */}
      <Stack.Screen
        name="left"
        options={{
          title: 'Left Page',
        }}
      />

      {/* 왼쪽으로 스와이프하면 이동할 페이지 */}
      <Stack.Screen
        name="right"
        options={{
          title: 'Right Page',
        }}
      />
    </Stack>
  );
};

export default MyPageLayout;
