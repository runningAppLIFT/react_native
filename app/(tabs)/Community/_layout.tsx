import React from 'react';
import { Stack } from 'expo-router';

const CommunityLayout = () => {
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
       <Stack.Screen name="index" options={{ title: 'Community'}} />
       <Stack.Screen name="crew" options={{ title: 'Crew' }} />
    </Stack>
  );
};

export default CommunityLayout;