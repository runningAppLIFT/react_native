import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Button } from 'react-native';
import { useAuth } from '@/hooks/authContext'; // 오타 수정: authContect -> authContext

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { user, signOut } = useAuth(); // 🔹 useAuth 훅에서 user와 signOut 가져오기
  const isLoggedIn = !!user; // 🔹 user가 있으면 로그인 상태로 간주

  // 🔹 로그인 함수: 로그인 화면으로 이동
  const handleLogin = () => {
    router.replace('/login');
  };

  // 🔹 로그아웃 함수: signOut 호출 후 로그인 화면으로 이동
  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Logout Failed:', error);
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
        headerRight: () => (
          <Button
            title={isLoggedIn ? 'Logout' : 'Login'}
            onPress={isLoggedIn ? handleLogout : handleLogin}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="login"
        options={{
          href: null, // ✅ 탭 바에서 login 화면 숨기기
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Board',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="map.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
