/**
 * ProfileScreen 컴포넌트 테스트
 * - 최고 레벨 달성 상태: maxLevelTitle/defaultLevelTitle(신규 i18n 키) 렌더링 회귀 테스트
 * - 일반 레벨: learnerSuffix + 레벨 타이틀 렌더링 스모크 테스트
 */

import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('../src/services/supabase', () => ({ supabase: null }));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));
jest.mock('../src/services/notificationService', () => ({
  getNotificationPermissionStatus: jest.fn().mockResolvedValue('undetermined'),
  requestNotificationPermission: jest.fn(),
  scheduleDailyReminder: jest.fn(),
  scheduleStreakWarning: jest.fn(),
  cancelDailyReminder: jest.fn(),
  cancelStreakWarning: jest.fn(),
}));

import ProfileScreen from '../src/screens/profile/ProfileScreen';
import { useAuthStore } from '../src/store/authStore';
import { useUserStore } from '../src/store/userStore';
import { ALL_LEVELS } from '../src/data/lessons';
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
  useUserStore.setState({
    xp: 0, streak: 0, lastStreakDate: null, progress: [], badges: [],
    todayMinutes: 0, todayLearned: false, aiChatCount: 0, todayAiChatCount: 0, aiChatCountDate: null,
  });
});

describe('ProfileScreen — 최고 레벨 달성 (존재하지 않는 레벨, i18n 회귀 테스트)', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { ...baseUser, current_level: 999 },
      hasCompletedOnboarding: true,
      onboardingData: {},
    });
  });

  it('maxLevelTitle과 defaultLevelTitle이 번역된 문자열로 렌더링된다', async () => {
    const { findByText } = await render(<ProfileScreen />);
    expect(await findByText('🏆 Max level reached!')).toBeTruthy();
    expect(await findByText('Beginner Learner')).toBeTruthy();
  });
});

describe('ProfileScreen — 일반 레벨 (스모크 테스트)', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: baseUser, hasCompletedOnboarding: true, onboardingData: {} });
  });

  it('레벨 1의 titleKo + learnerSuffix가 렌더링된다', async () => {
    const level1 = ALL_LEVELS.find((l) => l.level === 1)!;
    const { findByText } = await render(<ProfileScreen />);
    expect(await findByText(`${level1.titleKo} Learner`)).toBeTruthy();
  });
});
