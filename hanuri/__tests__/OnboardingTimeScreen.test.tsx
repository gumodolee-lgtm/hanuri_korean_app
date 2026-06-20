/**
 * OnboardingTimeScreen 컴포넌트 테스트
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

import OnboardingTimeScreen from '../src/screens/onboarding/OnboardingTimeScreen';
import { useAuthStore } from '../src/store/authStore';

beforeEach(() => {
  mockNavigate.mockClear();
  useAuthStore.setState({ user: null, hasCompletedOnboarding: false, onboardingData: {} });
});

describe('OnboardingTimeScreen', () => {
  it('타이틀과 3개 시간 옵션을 렌더링한다', async () => {
    await render(<OnboardingTimeScreen />);
    expect(screen.getByText('How many minutes per day?')).toBeTruthy();
    expect(screen.getByText('5min')).toBeTruthy();
    expect(screen.getByText('15min')).toBeTruthy();
    expect(screen.getByText('30min')).toBeTruthy();
  });

  it('30분 선택 후 다음 탭 시 setOnboardingData + navigate(OnboardingNotification)', async () => {
    await render(<OnboardingTimeScreen />);
    await fireEvent.press(screen.getByText('30min'));
    await fireEvent.press(screen.getByText('Next →'));
    expect(useAuthStore.getState().onboardingData.dailyGoalMinutes).toBe(30);
    expect(mockNavigate).toHaveBeenCalledWith('OnboardingNotification');
  });
});
