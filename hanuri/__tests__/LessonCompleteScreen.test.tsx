/**
 * LessonCompleteScreen 컴포넌트 테스트
 */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('../src/services/supabase', () => ({ supabase: null }));

const mockNavigate = jest.fn();
let mockRouteParams: { xp: number; score: number; expressions: string[] };
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useRoute: () => ({ params: mockRouteParams }),
}));

import LessonCompleteScreen from '../src/screens/lesson/LessonCompleteScreen';

beforeEach(() => {
  mockNavigate.mockClear();
});

describe('LessonCompleteScreen — rating tiers', () => {
  it('score>=90이면 perfect 등급을 보여준다', async () => {
    mockRouteParams = { xp: 50, score: 95, expressions: ['안녕하세요'] };
    await render(<LessonCompleteScreen />);
    expect(screen.getByText('Perfect!')).toBeTruthy();
  });

  it('score 70~89이면 great 등급을 보여준다', async () => {
    mockRouteParams = { xp: 30, score: 75, expressions: ['감사합니다'] };
    await render(<LessonCompleteScreen />);
    expect(screen.getByText('Great job!')).toBeTruthy();
  });

  it('score<70이면 tryAgain 등급을 보여준다', async () => {
    mockRouteParams = { xp: 10, score: 40, expressions: [] };
    await render(<LessonCompleteScreen />);
    expect(screen.getByText('Try again!')).toBeTruthy();
  });
});

describe('LessonCompleteScreen — 점수/XP/표현 렌더링', () => {
  beforeEach(() => {
    mockRouteParams = { xp: 42, score: 88, expressions: ['표현1', '표현2'] };
  });

  it('정확도/XP/단어 수를 렌더링한다', async () => {
    await render(<LessonCompleteScreen />);
    expect(screen.getByText('88%')).toBeTruthy();
    expect(screen.getByText('+42')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
  });

  it('학습한 표현 목록을 렌더링한다', async () => {
    await render(<LessonCompleteScreen />);
    expect(screen.getByText('표현1')).toBeTruthy();
    expect(screen.getByText('표현2')).toBeTruthy();
  });
});

describe('LessonCompleteScreen — 네비게이션', () => {
  beforeEach(() => {
    mockRouteParams = { xp: 10, score: 80, expressions: ['표현'] };
  });

  it('Back to Home 탭 시 Main으로 navigate한다', async () => {
    await render(<LessonCompleteScreen />);
    await fireEvent.press(screen.getByText('Back to Home'));
    expect(mockNavigate).toHaveBeenCalledWith('Main');
  });

  it('Next Lesson 탭 시 Main의 Lessons 탭으로 navigate한다', async () => {
    await render(<LessonCompleteScreen />);
    await fireEvent.press(screen.getByText('Next Lesson'));
    expect(mockNavigate).toHaveBeenCalledWith('Main', { screen: 'Lessons' });
  });
});
