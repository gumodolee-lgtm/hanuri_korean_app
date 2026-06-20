/**
 * OnboardingNotificationScreen 컴포넌트 테스트
 */

import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('../src/services/supabase', () => ({ supabase: null }));
jest.mock('../src/services/notificationService', () => ({
  requestNotificationPermission: jest.fn().mockResolvedValue(true),
  scheduleDailyReminder: jest.fn().mockResolvedValue(undefined),
  scheduleStreakWarning: jest.fn().mockResolvedValue(undefined),
}));

import OnboardingNotificationScreen from '../src/screens/onboarding/OnboardingNotificationScreen';
import { useAuthStore } from '../src/store/authStore';
import * as notificationService from '../src/services/notificationService';

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ user: null, hasCompletedOnboarding: false, onboardingData: {} });
});

describe('OnboardingNotificationScreen', () => {
  it('타이틀과 3개 시간대 옵션을 렌더링한다', async () => {
    await render(<OnboardingNotificationScreen />);
    expect(screen.getByText('Set your study reminder')).toBeTruthy();
  });

  it('"시작하기" 탭 시 알림 권한 요청 + completeOnboarding 호출', async () => {
    await render(<OnboardingNotificationScreen />);
    await fireEvent.press(screen.getByTestId('btn-start-app'));
    await waitFor(() => {
      expect(notificationService.requestNotificationPermission).toHaveBeenCalled();
    });
    expect(useAuthStore.getState().hasCompletedOnboarding).toBe(true);
  });

  it('"건너뛰기" 탭 시 알림 요청 없이 completeOnboarding 호출', async () => {
    await render(<OnboardingNotificationScreen />);
    await fireEvent.press(screen.getByTestId('btn-skip-notif'));
    expect(useAuthStore.getState().hasCompletedOnboarding).toBe(true);
    expect(notificationService.requestNotificationPermission).not.toHaveBeenCalled();
  });
});
