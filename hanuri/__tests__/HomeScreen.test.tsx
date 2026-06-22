/**
 * HomeScreen 컴포넌트 테스트
 * - 골든패스: 미완료 레슨이 있을 때 "이어서 학습" 카드 렌더링 + 탭 시 네비게이션
 * - 모든 레슨 완료 상태: allLessonsComplete* i18n 키 렌더링 회귀 테스트
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('../src/services/supabase', () => ({ supabase: null }));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

import HomeScreen from '../src/screens/home/HomeScreen';
import { useAuthStore } from '../src/store/authStore';
import { useUserStore } from '../src/store/userStore';
import { getLessonsForLevel } from '../src/data/lessons';
import { User } from '../src/types';

const baseUser: User = {
  id: 'guest_test',
  email: '',
  native_lang: 'en',
  current_level: 1,
  xp: 0,
  streak: 0,
  daily_goal_minutes: 15,
  learning_goal: 'travel',
  created_at: '2026-01-01',
};

beforeEach(() => {
  mockNavigate.mockClear();
  useAuthStore.setState({ user: baseUser, hasCompletedOnboarding: true, onboardingData: {} });
  useUserStore.setState({
    xp: 0, streak: 0, lastStreakDate: null, progress: [], badges: [],
    todayMinutes: 0, todayLearned: false, aiChatCount: 0, todayAiChatCount: 0, aiChatCountDate: null,
  });
});

describe('HomeScreen — 골든패스 (미완료 레슨 존재)', () => {
  it('통계와 "이어서 학습" 카드를 렌더링한다', async () => {
    const { getByText } = await render(<HomeScreen />);
    expect(getByText('⚡ Quick Start')).toBeTruthy();
    expect(getByText('▶ 덕질 Mode!')).toBeTruthy();
  });

  it('"이어서 학습" 버튼 탭 시 Lesson으로 navigate한다', async () => {
    const { getByText } = await render(<HomeScreen />);
    await fireEvent.press(getByText('▶ 덕질 Mode!'));
    expect(mockNavigate).toHaveBeenCalledWith('Lesson', expect.objectContaining({ lessonId: expect.any(String) }));
  });

  it('AI Chat 퀵카드 탭 시 AIHub로 navigate한다', async () => {
    const { getByText } = await render(<HomeScreen />);
    await fireEvent.press(getByText('AI Chat'));
    expect(mockNavigate).toHaveBeenCalledWith('AIHub');
  });
});

describe('HomeScreen — 모든 레슨 완료 상태 (i18n 회귀 테스트)', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { ...baseUser, current_level: 999 },
      hasCompletedOnboarding: true,
      onboardingData: {},
    });
  });

  it('allLessonsCompleteTitle/Sub/startAiChatBtn이 번역된 문자열로 렌더링된다', async () => {
    const { getByText } = await render(<HomeScreen />);
    expect(getByText('🎉 All lessons complete!')).toBeTruthy();
    expect(getByText('Keep your skills sharp with AI chat')).toBeTruthy();
    expect(getByText('Start AI Chat')).toBeTruthy();
  });

  it('"Start AI Chat" 버튼 탭 시 AIHub로 navigate한다', async () => {
    const { getByText } = await render(<HomeScreen />);
    await fireEvent.press(getByText('Start AI Chat'));
    expect(mockNavigate).toHaveBeenCalledWith('AIHub');
  });
});

describe('HomeScreen — PRO 레벨(7) 잠금', () => {
  beforeEach(() => {
    const level6Lessons = getLessonsForLevel(6);
    useAuthStore.setState({
      user: { ...baseUser, current_level: 6, isPro: false },
      hasCompletedOnboarding: true,
      onboardingData: {},
    });
    useUserStore.setState({
      progress: level6Lessons.map((l) => ({
        user_id: baseUser.id, lesson_id: l.id, status: 'completed' as const, score: 100, completed_at: '2026-01-01',
      })),
    });
  });

  it('레벨 6을 모두 완료한 non-pro 유저에게는 다음 카드가 PRO로 표시된다', async () => {
    const { getByText } = await render(<HomeScreen />);
    expect(getByText('👑 PRO')).toBeTruthy();
  });

  it('PRO 카드 탭 시 Lesson 대신 ProUpgrade로 navigate한다', async () => {
    const { getByText } = await render(<HomeScreen />);
    await fireEvent.press(getByText('👑 PRO'));
    expect(mockNavigate).toHaveBeenCalledWith('ProUpgrade');
    expect(mockNavigate).not.toHaveBeenCalledWith('Lesson', expect.anything());
  });
});
