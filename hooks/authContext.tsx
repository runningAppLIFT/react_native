import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { getProfile, login as kakaoLogin, logout as kakaoLogout } from '@react-native-seoul/kakao-login';

// AuthContext의 타입 정의
interface AuthContextType {
  user: { userId: string; kakao_id: number; nickname: string } | null; // 백엔드에서 반환되는 user 객체에 맞게 정의
  signInWithKakao: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

// createContext에 타입과 기본값 제공
const AuthContext = createContext<AuthContextType>({
  user: null,
  signInWithKakao: async () => {},
  signOut: async () => {},
  error: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ userId: string; kakao_id: number; nickname: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const profile = await getProfile();
        // 백엔드에서 사용자 정보 조회
        const response = await fetch('http://10.0.2.2:8080/auth/me', //안드로이드
        // const response = await fetch('http://localhost:8080/auth/me', 아이폰
          {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // 필요 시 토큰 추가
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user); // 백엔드에서 받은 user 객체 저장
        } else {
          setUser(null);
        }
      } catch (error: any) { // error 타입 명시
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

      // 백엔드로 kakao_id와 nickname 전송
      const response = await fetch('http://10.0.2.2:8080/auth/signup', {
      // const response = await fetch('http://localhost:8080/auth/signup',{ //아이폰
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kakao_id: Number(profile.id), // profile.id는 string이므로 Number로 변환
          nickname: profile.nickname,
        }),
      });

      if (!response.ok) {
        throw new Error('회원가입 요청 실패');
      }

      const data = await response.json();
      console.log('백엔드 응답:', data);

      setUser(data.user); // 백엔드에서 받은 user 객체로 설정
      setError(null);
    } catch (error: any) { // error 타입 명시
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
    } catch (error: any) { // error 타입 명시
      console.error('로그아웃 실패:', error);
      setError(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signInWithKakao, signOut, error }}>
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