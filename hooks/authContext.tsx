import React, { createContext, useState, useEffect, useContext } from 'react';
import { getProfile, login as kakaoLogin, logout as kakaoLogout } from '@react-native-seoul/kakao-login';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const profile = await getProfile();
        // 백엔드에서 사용자 정보 조회
        const response = await fetch('http://localhost:8080/auth/me', {
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
      } catch (error) {
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
      const response = await fetch('http://localhost:8080/auth/signup', {
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
    } catch (error) {
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
    } catch (error) {
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

export const useAuth = () => useContext(AuthContext);