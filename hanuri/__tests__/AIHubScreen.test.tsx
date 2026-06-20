/**
 * AIHubScreen 컴포넌트 테스트
 */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('../src/services/supabase', () => ({ supabase: null }));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

import AIHubScreen from '../src/screens/ai-chat/AIHubScreen';
import { useAuthStore } from '../src/store/authStore';
import { useUserStore } from '../src/store/userStore';
import { User } from '../src/types';

const freeUser: User = {
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
  useAuthStore.setState({ user: freeUser, hasCompletedOnboarding: true, onboardingData: {} });
  useUserStore.setState({
    xp: 0, streak: 0, lastStreakDate: null, progress: [], badges: [],
    todayMinutes: 0, todayLearned: false, aiChatCount: 0, todayAiChatCount: 0, aiChatCountDate: null,
  });
});

describe('AIHubScreen — 무료 유저', () => {
  it('무료/PRO 시나리오 섹션을 렌더링한다', async () => {
    await render(<AIHubScreen />);
    expect(screen.getByText('🗣️ AI Chat')).toBeTruthy();
    expect(screen.getByText('Free Scenarios')).toBeTruthy();
    expect(screen.getByText('PRO Scenarios')).toBeTruthy();
    expect(screen.getByTestId('scenario-cafe')).toBeTruthy();
    expect(screen.getByTestId('scenario-business')).toBeTruthy();
  });

  it('무료 시나리오 탭 시 AIChat으로 navigate한다', async () => {
    await render(<AIHubScreen />);
    await fireEvent.press(screen.getByTestId('scenario-cafe'));
    expect(mockNavigate).toHaveBeenCalledWith('AIChat', { scenarioId: 'cafe' });
  });

  it('PRO 시나리오 탭 시 (비PRO 유저) ProUpgrade로 navigate한다', async () => {
    await render(<AIHubScreen />);
    await fireEvent.press(screen.getByTestId('scenario-business'));
    expect(mockNavigate).toHaveBeenCalledWith('ProUpgrade');
  });

  it('일일 무료 채팅 한도(3회) 도달 시 무료 시나리오도 ProUpgrade로 navigate한다', async () => {
    useUserStore.setState({ todayAiChatCount: 3 });
    await render(<AIHubScreen />);
    await fireEvent.press(screen.getByTestId('scenario-cafe'));
    expect(mockNavigate).toHaveBeenCalledWith('ProUpgrade');
  });
});

describe('AIHubScreen — PRO 유저', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: { ...freeUser, isPro: true }, hasCompletedOnboarding: true, onboardingData: {} });
  });

  it('PRO 시나리오도 잠금 없이 AIChat으로 navigate한다', async () => {
    await render(<AIHubScreen />);
    await fireEvent.press(screen.getByTestId('scenario-business'));
    expect(mockNavigate).toHaveBeenCalledWith('AIChat', { scenarioId: 'business' });
  });
});
