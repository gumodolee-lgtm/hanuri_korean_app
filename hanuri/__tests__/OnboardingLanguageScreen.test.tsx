/**
 * OnboardingLanguageScreen 컴포넌트 테스트
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

import OnboardingLanguageScreen from '../src/screens/onboarding/OnboardingLanguageScreen';
import { useAuthStore } from '../src/store/authStore';

beforeEach(() => {
  mockNavigate.mockClear();
  useAuthStore.setState({ user: null, hasCompletedOnboarding: false, onboardingData: {} });
});

describe('OnboardingLanguageScreen', () => {
  it('타이틀과 6개 언어 옵션을 렌더링한다', async () => {
    await render(<OnboardingLanguageScreen />);
    expect(screen.getByText('What language do you speak?')).toBeTruthy();
    expect(screen.getByTestId('lang-en')).toBeTruthy();
    expect(screen.getByTestId('lang-ko')).toBeTruthy();
    expect(screen.getByTestId('lang-es')).toBeTruthy();
    expect(screen.getByTestId('lang-zh')).toBeTruthy();
    expect(screen.getByTestId('lang-ja')).toBeTruthy();
    expect(screen.getByTestId('lang-vi')).toBeTruthy();
  });

  it('언어 선택 후 다음 탭 시 setOnboardingData + navigate(OnboardingGoal)', async () => {
    await render(<OnboardingLanguageScreen />);
    await fireEvent.press(screen.getByTestId('lang-ko'));
    await fireEvent.press(screen.getByTestId('btn-next-lang'));
    expect(useAuthStore.getState().onboardingData.nativeLanguage).toBe('ko');
    expect(mockNavigate).toHaveBeenCalledWith('OnboardingGoal');
  });
});
