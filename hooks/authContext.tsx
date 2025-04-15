import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { getProfile, login as kakaoLogin, logout as kakaoLogout } from '@react-native-seoul/kakao-login';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl;

// AuthContext의 타입 정의
interface AuthContextType {
  user: { userId: string; kakao_id: number; nickname: string; createdAt?: string } | null;
  setUser: (user: { userId: string; kakao_id: number; nickname: string; createdAt?: string } | null) => void;
  signInWithKakao: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

// createContext에 타입과 기본값 제공
const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  signInWithKakao: async () => {},
  signOut: async () => {},
  error: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ userId: string; kakao_id: number; nickname: string; createdAt?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const profile = await getProfile();
        const response = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error: any) {
        setUser(null);
      }
    };
    checkLoginStatus();
  }, []);

  const signInWithKakao = async () => {
    try {
      const token = await kakaoLogin();
      console.log('카카오 로그인 성공:', token);
      const profile = await getProfile();

      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kakao_id: Number(profile.id),
          nickname: profile.nickname,
        }),
      });

      if (!response.ok) {
        throw new Error('회원가입 요청 실패');
      }

      const data = await response.json();
      console.log('백엔드 응답:', data);

      setUser(data.user);
      setError(null);
    } catch (error: any) {
      console.error('카카오 로그인 실패:', error);
      setError(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await kakaoLogout();
      setUser(null);
      setError(null);
    } catch (error: any) {
      console.error('로그아웃 실패:', error);
      setError(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, signInWithKakao, signOut, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};