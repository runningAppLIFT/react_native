import React from 'react';
import { Stack } from 'expo-router';

const RunningLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal', // index -> RunningHistory: 오른쪽→왼쪽
        gestureResponseDistance: 300, // 시뮬레이터용 초고감도
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="freeRun" />
      <Stack.Screen name="courseRun/index" />
      <Stack.Screen name="courseRun/courseRunMap" />
      <Stack.Screen name="detailRun" />
      <Stack.Screen
        name="RunningHistory"
        options={{
          gestureEnabled: true, // RunningHistory -> index: 왼쪽→오른쪽 (기본 뒤로 가기)
        }}
        // listeners={{
        //   transitionStart: () => console.log('Transition started'),
        //   transitionEnd: () => console.log('Transition ended'),
        // }}
      />
    </Stack>
  );
};

export default RunningLayout;