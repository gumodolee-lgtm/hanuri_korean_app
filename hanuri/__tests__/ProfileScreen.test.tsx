/**
 * ProfileScreen 컴포넌트 테스트
 * - 최고 레벨 달성 상태: maxLevelTitle/defaultLevelTitle(신규 i18n 키) 렌더링 회귀 테스트
 * - 일반 레벨: learnerSuffix + 레벨 타이틀 렌더링 스모크 테스트
 */

import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, screen } from '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('../src/services/supabase', () => ({ supabase: null }));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));
jest.mock('../src/services/notificationService', () => ({
  getNotificationPermissionStatus: jest.fn().mockResolvedValue('undetermined'),
  requestNotificationPermission: jest.fn(),
  scheduleDailyReminder: jest.fn(),
  scheduleStreakWarning: jest.fn(),
  cancelDailyReminder: jest.fn(),
  cancelStreakWarning: jest.fn(),
}));

import ProfileScreen from '../src/screens/profile/ProfileScreen';
import { useAuthStore } from '../src/store/authStore';
import { useUserStore } from '../src/store/userStore';
import { ALL_LEVELS } from '../src/data/lessons';
import { User } from '../src/types';
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  scheduleStreakWarning,
  cancelDailyReminder,
  cancelStreakWarning,
} from '../src/services/notificationService';

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
  useUserStore.setState({
    xp: 0, streak: 0, lastStreakDate: null, progress: [], badges: [],
    todayMinutes: 0, todayLearned: false, aiChatCount: 0, todayAiChatCount: 0, aiChatCountDate: null,
  });
});

describe('ProfileScreen — 최고 레벨 달성 (존재하지 않는 레벨, i18n 회귀 테스트)', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { ...baseUser, current_level: 999 },
      hasCompletedOnboarding: true,
      onboardingData: {},
    });
  });

  it('maxLevelTitle과 defaultLevelTitle이 번역된 문자열로 렌더링된다', async () => {
    const { findByText } = await render(<ProfileScreen />);
    expect(await findByText('🏆 Max level reached!')).toBeTruthy();
    expect(await findByText('Beginner Learner')).toBeTruthy();
  });
});

describe('ProfileScreen — 일반 레벨 (스모크 테스트)', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: baseUser, hasCompletedOnboarding: true, onboardingData: {} });
  });

  it('레벨 1의 titleKo + learnerSuffix가 렌더링된다', async () => {
    const level1 = ALL_LEVELS.find((l) => l.level === 1)!;
    const { findByText } = await render(<ProfileScreen />);
    expect(await findByText(`${level1.titleKo} Learner`)).toBeTruthy();
  });
});

describe('ProfileScreen — 알림 토글', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: baseUser, hasCompletedOnboarding: true, onboardingData: {} });
  });

  it('권한이 허용되면 알림을 예약하고 스위치를 켠다', async () => {
    (requestNotificationPermission as jest.Mock).mockResolvedValueOnce(true);
    await render(<ProfileScreen />);
    const switchEl = screen.getByRole('switch');
    await fireEvent(switchEl, 'valueChange', true);
    expect(scheduleDailyReminder).toHaveBeenCalledWith(expect.objectContaining({ hour: 20, minute: 0 }));
    expect(scheduleStreakWarning).toHaveBeenCalled();
    expect(screen.getByRole('switch').props.value).toBe(true);
  });

  it('권한이 거부되면 알림 권한 안내를 띄운다', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    (requestNotificationPermission as jest.Mock).mockResolvedValueOnce(false);
    await render(<ProfileScreen />);
    const switchEl = screen.getByRole('switch');
    await fireEvent(switchEl, 'valueChange', true);
    expect(alertSpy).toHaveBeenCalledWith('Permission Required', 'Please allow notifications in Settings.', [{ text: 'OK' }]);
    alertSpy.mockRestore();
  });

  it('끄면 예약된 알림을 취소한다', async () => {
    await render(<ProfileScreen />);
    const switchEl = screen.getByRole('switch');
    await fireEvent(switchEl, 'valueChange', false);
    expect(cancelDailyReminder).toHaveBeenCalled();
    expect(cancelStreakWarning).toHaveBeenCalled();
  });
});

describe('ProfileScreen — PRO 업그레이드 배너', () => {
  it('비-PRO 유저는 배너가 보이고 탭하면 ProUpgrade로 이동한다', async () => {
    useAuthStore.setState({ user: { ...baseUser, isPro: false }, hasCompletedOnboarding: true, onboardingData: {} });
    await render(<ProfileScreen />);
    await fireEvent.press(screen.getByText('Upgrade to HANURI PRO'));
    expect(mockNavigate).toHaveBeenCalledWith('ProUpgrade');
  });

  it('PRO 유저는 배너 대신 PRO 배지를 보여준다', async () => {
    useAuthStore.setState({ user: { ...baseUser, isPro: true }, hasCompletedOnboarding: true, onboardingData: {} });
    await render(<ProfileScreen />);
    expect(screen.queryByText('Upgrade to HANURI PRO')).toBeNull();
    expect(screen.getByText('👑 PRO')).toBeTruthy();
  });
});

describe('ProfileScreen — 배지 잠금/해제', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: baseUser, hasCompletedOnboarding: true, onboardingData: {} });
  });

  it('조건을 만족하지 않으면 모든 배지가 잠겨있다', async () => {
    useUserStore.setState({
      xp: 0, streak: 0, lastStreakDate: null, progress: [], badges: [],
      todayMinutes: 0, todayLearned: false, aiChatCount: 0, todayAiChatCount: 0, aiChatCountDate: null,
    });
    await render(<ProfileScreen />);
    expect(screen.getAllByText('🔒')).toHaveLength(6);
  });

  it('streak>=7이면 7-Day Streak 배지가 해제된다', async () => {
    useUserStore.setState({
      xp: 0, streak: 7, lastStreakDate: null, progress: [], badges: [],
      todayMinutes: 0, todayLearned: false, aiChatCount: 0, todayAiChatCount: 0, aiChatCountDate: null,
    });
    await render(<ProfileScreen />);
    expect(screen.getByText('🔥')).toBeTruthy();
    expect(screen.getAllByText('🔒')).toHaveLength(5);
  });

  it('퀴즈 100점 기록이 있으면 Quiz Master 배지가 해제된다', async () => {
    useUserStore.setState({
      xp: 0, streak: 0, lastStreakDate: null,
      progress: [{ user_id: 'guest_test', lesson_id: 'l1', status: 'completed', score: 100 }],
      badges: [], todayMinutes: 0, todayLearned: false, aiChatCount: 0, todayAiChatCount: 0, aiChatCountDate: null,
    });
    await render(<ProfileScreen />);
    expect(screen.getByText('💯')).toBeTruthy();
  });
});

describe('ProfileScreen — 일일 목표 변경', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: baseUser, hasCompletedOnboarding: true, onboardingData: {} });
  });

  it('목표를 선택 후 저장하면 updateProfile이 호출되고 모달이 닫힌다', async () => {
    await render(<ProfileScreen />);
    await fireEvent.press(screen.getByText('🎯 Daily Goal'));
    await fireEvent.press(screen.getByText('30 min / Intensive'));
    await fireEvent.press(screen.getByText('Save'));
    expect(useAuthStore.getState().user?.daily_goal_minutes).toBe(30);
    expect(screen.queryByText('Daily Goal')).toBeNull();
  });

  it('취소하면 변경되지 않는다', async () => {
    await render(<ProfileScreen />);
    await fireEvent.press(screen.getByText('🎯 Daily Goal'));
    await fireEvent.press(screen.getByText('30 min / Intensive'));
    await fireEvent.press(screen.getByText('Cancel'));
    expect(useAuthStore.getState().user?.daily_goal_minutes).toBe(15);
  });
});

describe('ProfileScreen — 모국어 변경', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: baseUser, hasCompletedOnboarding: true, onboardingData: {} });
  });

  it('언어를 선택 후 저장하면 updateProfile이 호출된다', async () => {
    await render(<ProfileScreen />);
    await fireEvent.press(screen.getByText('🌍 Native Language'));
    await fireEvent.press(screen.getByText('🇰🇷 한국어'));
    await fireEvent.press(screen.getByText('Save'));
    expect(useAuthStore.getState().user?.native_lang).toBe('ko');
  });
});

describe('ProfileScreen — 다크모드 전환', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: baseUser, hasCompletedOnboarding: true, onboardingData: {}, themeMode: 'system' });
  });

  it('Dark 탭 시 setThemeMode("dark")가 호출된다', async () => {
    await render(<ProfileScreen />);
    await fireEvent.press(screen.getByText('Dark'));
    expect(useAuthStore.getState().themeMode).toBe('dark');
  });

  it('Light 탭 시 setThemeMode("light")가 호출된다', async () => {
    await render(<ProfileScreen />);
    await fireEvent.press(screen.getByText('Light'));
    expect(useAuthStore.getState().themeMode).toBe('light');
  });
});

describe('ProfileScreen — 로그아웃', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: baseUser, hasCompletedOnboarding: true, onboardingData: {} });
  });

  it('탭하면 확인 알림을 띄우고, 확인을 누르면 signOut이 실행된다', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
      const confirmBtn = buttons?.find((b) => b.style === 'destructive');
      confirmBtn?.onPress?.();
    });
    await render(<ProfileScreen />);
    await fireEvent.press(screen.getByText('Sign Out'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Sign Out',
      'Are you sure you want to sign out?',
      expect.any(Array)
    );
    expect(useAuthStore.getState().user).toBeNull();
    alertSpy.mockRestore();
  });
});
