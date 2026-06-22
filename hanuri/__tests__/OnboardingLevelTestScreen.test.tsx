/**
 * OnboardingLevelTestScreen 컴포넌트 테스트
 */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('../src/services/supabase', () => ({ supabase: null }));

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
}));

import OnboardingLevelTestScreen from '../src/screens/onboarding/OnboardingLevelTestScreen';
import { useAuthStore } from '../src/store/authStore';

// [correct answer, wrong-but-valid choice] for each of the 5 questions, in order
const CHOICES: [string, string][] = [
  ['Hello / Hi', 'Thank you'],
  ['Give me this please', 'How much is this?'],
  ["It's okay / I'm fine", "I'm hungry"],
  ['Please wait a moment', 'Follow me please'],
  ['We may need to postpone the meeting', 'The meeting started late'],
];

async function answer(choiceText: string, nextText: string) {
  await fireEvent.press(screen.getByText(choiceText));
  await screen.findByText(nextText, {}, { timeout: 2000 });
}

async function answerAllCorrect() {
  await answer(CHOICES[0][0], '2 / 5');
  await answer(CHOICES[1][0], '3 / 5');
  await answer(CHOICES[2][0], '4 / 5');
  await answer(CHOICES[3][0], '5 / 5');
  await answer(CHOICES[4][0], 'Test Complete!');
}

beforeEach(() => {
  mockGoBack.mockClear();
  useAuthStore.setState({ user: null, hasCompletedOnboarding: false, onboardingData: {} });
});

describe('OnboardingLevelTestScreen — 진행', () => {
  it('첫 질문과 진행도를 렌더링한다', async () => {
    await render(<OnboardingLevelTestScreen />);
    expect(screen.getByText('1 / 5')).toBeTruthy();
    expect(screen.getByText('안녕하세요 means:')).toBeTruthy();
  });

  it('답을 고르면 800ms 후 다음 질문으로 넘어간다', async () => {
    await render(<OnboardingLevelTestScreen />);
    await answer(CHOICES[0][0], '2 / 5');
    expect(screen.getByText('이거 주세요 means:')).toBeTruthy();
  });
});

describe('OnboardingLevelTestScreen — 결과 화면', () => {
  it('5문항 모두 정답이면 추천 레벨 5(중급)를 보여준다', async () => {
    await render(<OnboardingLevelTestScreen />);
    await answerAllCorrect();
    expect(screen.getByText('5 / 5 correct')).toBeTruthy();
    expect(screen.getByText('⚡ 중급 (Intermediate)')).toBeTruthy();
  });

  it('1문항만 정답이면 추천 레벨 1(입문)을 보여준다', async () => {
    await render(<OnboardingLevelTestScreen />);
    await answer(CHOICES[0][0], '2 / 5');
    await answer(CHOICES[1][1], '3 / 5');
    await answer(CHOICES[2][1], '4 / 5');
    await answer(CHOICES[3][1], '5 / 5');
    await answer(CHOICES[4][1], 'Test Complete!');
    expect(screen.getByText('1 / 5 correct')).toBeTruthy();
    expect(screen.getByText('🌱 입문 (Beginner)')).toBeTruthy();
  });

  it('Start at this level 탭 시 setOnboardingData + goBack이 호출된다', async () => {
    await render(<OnboardingLevelTestScreen />);
    await answerAllCorrect();
    await fireEvent.press(screen.getByText('Start at this level →'));
    expect(useAuthStore.getState().onboardingData.currentLevel).toBe(5);
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('Choose level manually 탭 시 goBack이 호출된다', async () => {
    await render(<OnboardingLevelTestScreen />);
    await answerAllCorrect();
    await fireEvent.press(screen.getByText('Choose level manually'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});

describe('OnboardingLevelTestScreen — 뒤로가기', () => {
  it('상단 Back 버튼 탭 시 goBack이 호출된다', async () => {
    await render(<OnboardingLevelTestScreen />);
    await fireEvent.press(screen.getByText('← Back'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
