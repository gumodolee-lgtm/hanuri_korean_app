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

describe('LessonsScreen — PRO 레벨(7-8) 잠금', () => {
  it('non-pro 유저가 레벨 7 탭을 탭하면 ProUpgrade로 이동하고 선택되지 않는다', async () => {
    useAuthStore.setState({ user: { ...baseUser, current_level: 7, isPro: false }, hasCompletedOnboarding: true, onboardingData: {} });
    await render(<LessonsScreen />);
    await fireEvent.press(screen.getByTestId('level-tab-7'));
    expect(mockNavigate).toHaveBeenCalledWith('ProUpgrade');
  });

  it('non-pro 유저가 current_level=7이면 7레벨 레슨 대신 6레벨이 기본 선택된다', async () => {
    useAuthStore.setState({ user: { ...baseUser, current_level: 7, isPro: false }, hasCompletedOnboarding: true, onboardingData: {} });
    await render(<LessonsScreen />);
    const level6FirstLesson = ALL_LEVELS[5].units[0].lessons[0];
    expect(screen.getByTestId(`lesson-card-${level6FirstLesson.id}`)).toBeTruthy();
  });

  it('PRO 유저는 레벨 7 탭을 정상적으로 선택할 수 있다', async () => {
    useAuthStore.setState({ user: { ...baseUser, current_level: 7, isPro: true }, hasCompletedOnboarding: true, onboardingData: {} });
    await render(<LessonsScreen />);
    await fireEvent.press(screen.getByTestId('level-tab-7'));
    expect(mockNavigate).not.toHaveBeenCalledWith('ProUpgrade');
    const level7FirstLesson = ALL_LEVELS[6].units[0].lessons[0];
    expect(screen.getByTestId(`lesson-card-${level7FirstLesson.id}`)).toBeTruthy();
  });

  it('PRO 유저는 레벨 7 첫 레슨 탭 시 Lesson으로 navigate한다', async () => {
    useAuthStore.setState({ user: { ...baseUser, current_level: 7, isPro: true }, hasCompletedOnboarding: true, onboardingData: {} });
    await render(<LessonsScreen />);
    const level7FirstLesson = ALL_LEVELS[6].units[0].lessons[0];
    await fireEvent.press(screen.getByTestId(`lesson-card-${level7FirstLesson.id}`));
    expect(mockNavigate).toHaveBeenCalledWith('Lesson', { lessonId: level7FirstLesson.id });
  });
});
