/**
 * OnboardingLevelScreen 컴포넌트 테스트
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
  useFocusEffect: (require('react').useEffect),
}));

import OnboardingLevelScreen from '../src/screens/onboarding/OnboardingLevelScreen';
import { useAuthStore } from '../src/store/authStore';

beforeEach(() => {
  mockNavigate.mockClear();
  useAuthStore.setState({ user: null, hasCompletedOnboarding: false, onboardingData: {} });
});

describe('OnboardingLevelScreen', () => {
  it('타이틀과 4개 레벨 옵션을 렌더링한다', async () => {
    await render(<OnboardingLevelScreen />);
    expect(screen.getByText("What's your current Korean level?")).toBeTruthy();
    expect(screen.getByTestId('level-1')).toBeTruthy();
    expect(screen.getByTestId('level-2')).toBeTruthy();
    expect(screen.getByTestId('level-3')).toBeTruthy();
    expect(screen.getByTestId('level-5')).toBeTruthy();
  });

  it('레벨 선택 후 다음 탭 시 setOnboardingData + navigate(OnboardingTime)', async () => {
    await render(<OnboardingLevelScreen />);
    await fireEvent.press(screen.getByTestId('level-3'));
    await fireEvent.press(screen.getByTestId('btn-next-level'));
    expect(useAuthStore.getState().onboardingData.currentLevel).toBe(3);
    expect(mockNavigate).toHaveBeenCalledWith('OnboardingTime');
  });

  it('레벨 테스트 링크 탭 시 OnboardingLevelTest로 navigate한다', async () => {
    await render(<OnboardingLevelScreen />);
    await fireEvent.press(screen.getByText('→ Check with level test'));
    expect(mockNavigate).toHaveBeenCalledWith('OnboardingLevelTest');
  });
});
