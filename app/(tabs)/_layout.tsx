import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, Button, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '@/hooks/authContext';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter, usePathname } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const isLoggedIn = !!user;

  const handleLogin = () => {
    router.replace('/login');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Logout Failed:', error);
    }
  };

  // myPage 탭 클릭 시 로그인 체크
  const handleMyPagePress = () => {
    if (!isLoggedIn) {
      Alert.alert(
        '로그인 필요',
        '마이페이지를 보려면 로그인이 필요합니다.',
        [
          { text: '취소', style: 'cancel' },
          { text: '로그인', onPress: () => router.replace('/login') },
        ]
      );
      return false; // 탭 이동 방지
    }
    return true; // 탭 이동 허용
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        initialRouteName="index"
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
            href: null,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Community',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="bubble.left.and.bubble.right" color={color} />,
          }}
        />
        <Tabs.Screen
          name="Running"
          options={{
            title: 'Running',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="figure.run" color={color} />,
          }}
          listeners={{
            tabPress: () => console.log('Running tab pressed'),
          }}
        />
        <Tabs.Screen
          name="course"
          options={{
            title: 'Course',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="map.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="myPage"
          options={{
            title: 'Mypage',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
          listeners={{
            tabPress: (e) => {
              if (!handleMyPagePress()) {
                e.preventDefault();
              }
            },
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}