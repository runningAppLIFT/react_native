import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Button } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '@/hooks/authContext';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}