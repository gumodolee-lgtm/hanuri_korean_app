/**
 * LeaderboardScreen 컴포넌트 테스트
 * - 게스트: guestPrompt + loginBtn(신규 i18n 키) 렌더링 회귀 테스트
 * - 인증 유저: mock 데이터 podium 렌더링 스모크 테스트
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('../src/services/supabase', () => ({ supabase: null }));

import LeaderboardScreen from '../src/screens/profile/LeaderboardScreen';
import { useAuthStore } from '../src/store/authStore';
import { useUserStore } from '../src/store/userStore';
import { User } from '../src/types';

const authedUser: User = {
  id: 'user_test_1',
  email: 'test@example.com',
  native_lang: 'en',
  current_level: 1,
  xp: 100,
  streak: 2,
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

describe('LeaderboardScreen — 게스트 (i18n 회귀 테스트)', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, hasCompletedOnboarding: true, onboardingData: {} });
  });

  it('guestPrompt와 loginBtn이 번역된 문자열로 렌더링된다', async () => {
    const { getByText } = await render(<LeaderboardScreen />);
    expect(getByText('Sign in to see the real leaderboard')).toBeTruthy();
    expect(getByText('🔑 Sign in with Google')).toBeTruthy();
  });

  it('loginBtn 탭 시 signOut이 호출된다 (게스트→로그인 화면 전환 트리거)', async () => {
    const signOutSpy = jest.spyOn(useAuthStore.getState(), 'signOut');
    const { getByText } = await render(<LeaderboardScreen />);
    await fireEvent.press(getByText('🔑 Sign in with Google'));
    expect(signOutSpy).toHaveBeenCalled();
  });
});

describe('LeaderboardScreen — 인증 유저 (mock 데이터 스모크 테스트)', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: authedUser, hasCompletedOnboarding: true, onboardingData: {} });
  });

  it('mock 리더보드 podium이 렌더링된다', async () => {
    const { findByText } = await render(<LeaderboardScreen />);
    expect(await findByText('🏆 Ranking')).toBeTruthy();
  });
});
