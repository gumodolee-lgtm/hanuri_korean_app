import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { useConfigStore } from '../store/configStore';
import { supabase } from '../services/supabase';
import { useTheme } from '../contexts/ThemeContext';
import MainTabNavigator from './MainTabNavigator';
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingNavigator from './OnboardingNavigator';
import LessonPlayerScreen from '../screens/lesson/LessonPlayerScreen';
import LessonCompleteScreen from '../screens/lesson/LessonCompleteScreen';
import AIChatScreen from '../screens/ai-chat/AIChatScreen';
import ProUpgradeScreen from '../screens/pro/ProUpgradeScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user } = useAuthStore();
  const { checkNewDay } = useUserStore();
  const { loadConfig } = useConfigStore();
  const { isDark } = useTheme();

  // 앱 시작 시 날짜 경계 처리: todayMinutes/todayLearned 초기화, 연속 학습 만료 시 streak 리셋
  useEffect(() => {
    checkNewDay();
  }, [checkNewDay]);

  // 앱 시작 시 원격 설정(예: 무료/PRO 레벨 경계) 갱신 — 실패해도 앱 내 기본값으로 동작
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Supabase 세션 외부 변경 감지: 토큰 만료, 다른 기기 로그아웃 등
  // getState()로 직접 접근하여 클로저 stale 문제 방지
  useEffect(() => {
    const subscription = supabase?.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        useAuthStore.getState().signOut();
      }
    }).data.subscription;
    return () => subscription?.unsubscribe();
  }, []);

  const navTheme = isDark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: '#101010', card: '#1C1C1E' } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: '#F7F9FA', card: '#FFFFFF' } };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#101010' : '#F7F9FA'} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="Lesson" component={LessonPlayerScreen} />
            <Stack.Screen name="LessonComplete" component={LessonCompleteScreen} />
            <Stack.Screen name="AIChat" component={AIChatScreen} />
            <Stack.Screen name="ProUpgrade" component={ProUpgradeScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
