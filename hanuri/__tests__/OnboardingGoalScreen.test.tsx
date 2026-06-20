/**
 * OnboardingGoalScreen 컴포넌트 테스트
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

import OnboardingGoalScreen from '../src/screens/onboarding/OnboardingGoalScreen';
import { useAuthStore } from '../src/store/authStore';

beforeEach(() => {
  mockNavigate.mockClear();
  useAuthStore.setState({ user: null, hasCompletedOnboarding: false, onboardingData: {} });
});

describe('OnboardingGoalScreen', () => {
  it('타이틀과 5개 목표 옵션을 렌더링한다', async () => {
    await render(<OnboardingGoalScreen />);
    expect(screen.getByText('Why are you learning Korean?')).toBeTruthy();
    expect(screen.getByTestId('goal-kpop')).toBeTruthy();
    expect(screen.getByTestId('goal-travel')).toBeTruthy();
    expect(screen.getByTestId('goal-business')).toBeTruthy();
    expect(screen.getByTestId('goal-topik')).toBeTruthy();
    expect(screen.getByTestId('goal-relationship')).toBeTruthy();
  });

  it('목표 선택 후 다음 탭 시 setOnboardingData + navigate(OnboardingLevel)', async () => {
    await render(<OnboardingGoalScreen />);
    await fireEvent.press(screen.getByTestId('goal-business'));
    await fireEvent.press(screen.getByTestId('btn-next-goal'));
    expect(useAuthStore.getState().onboardingData.learningGoal).toBe('business');
    expect(mockNavigate).toHaveBeenCalledWith('OnboardingLevel');
  });
});
