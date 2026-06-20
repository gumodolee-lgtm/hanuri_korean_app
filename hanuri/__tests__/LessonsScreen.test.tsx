/**
 * LessonsScreen 컴포넌트 테스트
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

import LessonsScreen from '../src/screens/lesson/LessonsScreen';
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
  mockNavigate.mockClear();
  useAuthStore.setState({ user: baseUser, hasCompletedOnboarding: true, onboardingData: {} });
  useUserStore.setState({
    xp: 0, streak: 0, lastStreakDate: null, progress: [], badges: [],
    todayMinutes: 0, todayLearned: false, aiChatCount: 0, todayAiChatCount: 0, aiChatCountDate: null,
  });
});

describe('LessonsScreen', () => {
  it('레벨 탭과 레슨 카드를 렌더링한다', async () => {
    await render(<LessonsScreen />);
    expect(screen.getByText('📚 Lessons')).toBeTruthy();
    const firstLesson = ALL_LEVELS[0].units[0].lessons[0];
    expect(screen.getByTestId(`lesson-card-${firstLesson.id}`)).toBeTruthy();
  });

  it('잠금 해제된 첫 레슨 탭 시 Lesson으로 navigate한다', async () => {
    await render(<LessonsScreen />);
    const firstLesson = ALL_LEVELS[0].units[0].lessons[0];
    await fireEvent.press(screen.getByTestId(`lesson-card-${firstLesson.id}`));
    expect(mockNavigate).toHaveBeenCalledWith('Lesson', { lessonId: firstLesson.id });
  });

  it('미완료 상태에서 두 번째 레슨은 잠겨있어 disabled 상태다', async () => {
    await render(<LessonsScreen />);
    const secondLesson = ALL_LEVELS[0].units[0].lessons[1];
    const card = screen.getByTestId(`lesson-card-${secondLesson.id}`);
    expect(card.props.accessibilityState?.disabled ?? card.props.disabled).toBeTruthy();
  });

  it('완료된 레슨 탭 시에도 Lesson으로 navigate한다 (잠금 해제 상태 유지)', async () => {
    const firstLesson = ALL_LEVELS[0].units[0].lessons[0];
    useUserStore.setState({
      progress: [{ user_id: baseUser.id, lesson_id: firstLesson.id, status: 'completed', score: 100, completed_at: '2026-01-01' }],
    });
    await render(<LessonsScreen />);
    const secondLesson = ALL_LEVELS[0].units[0].lessons[1];
    await fireEvent.press(screen.getByTestId(`lesson-card-${secondLesson.id}`));
    expect(mockNavigate).toHaveBeenCalledWith('Lesson', { lessonId: secondLesson.id });
  });
});
