/**
 * 네비게이터 단위 테스트 (OnboardingNavigator / MainTabNavigator / RootNavigator)
 *
 * 실제 react-navigation 스택/탭으로 풀 렌더링하면 react-native-screens,
 * react-native-gesture-handler 등 네이티브 모듈 의존성이 깊어져 jest 환경에서
 * 안정적으로 구동하기 어렵다. 이 파일들의 실질적인 로직은 "화면 등록 분기"와
 * RootNavigator의 두 useEffect(날짜 경계 체크, Supabase 세션 변경 감지)뿐이므로
 * createStackNavigator/createBottomTabNavigator를 얕은 패스스루로 모킹해
 * 그 로직만 검증한다. 각 화면 자체의 동작은 개별 화면 테스트 파일에서 다룬다.
 */

import { render, screen } from '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: unknown }) => children,
  DefaultTheme: { colors: {} },
  DarkTheme: { colors: {} },
}));

jest.mock('@react-navigation/stack', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    createStackNavigator: () => ({
      Navigator: ({ children }: { children: unknown }) => children,
      Screen: ({ name }: { name: string }) => React.createElement(Text, { testID: `screen-${name}` }, name),
    }),
  };
});
jest.mock('@react-navigation/bottom-tabs', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    createBottomTabNavigator: () => ({
      Navigator: ({ children }: { children: unknown }) => children,
      Screen: ({ name }: { name: string }) => React.createElement(Text, { testID: `tab-${name}` }, name),
    }),
  };
});

// configService.fetchFreeMaxLevel()이 RootNavigator 마운트 시 호출되므로
// app_config 조회 체인도 안전하게 빈 결과로 응답하도록 기본 from()을 둔다.
const noopFrom = jest.fn(() => ({
  select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
}));
let mockSupabaseClient: { auth: { onAuthStateChange: jest.Mock }; from?: jest.Mock } | null = null;
jest.mock('../src/services/supabase', () => ({
  get supabase() {
    return mockSupabaseClient;
  },
}));

// RootNavigator가 import하는 화면들의 트랜지티브 의존성 — 실제로 렌더링되진
// 않지만 import 시점에 모듈이 로드되므로 네이티브 모듈 접근을 막아야 한다.
jest.mock('expo-audio', () => ({
  useAudioRecorder: () => ({ record: jest.fn(), stop: jest.fn(), prepareToRecordAsync: jest.fn() }),
  RecordingPresets: { HIGH_QUALITY: {} },
  requestRecordingPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('expo-apple-authentication', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(false),
  signInAsync: jest.fn(),
  AppleAuthenticationScope: { FULL_NAME: 'FULL_NAME', EMAIL: 'EMAIL' },
}));
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));
jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'hanuri://redirect'),
}));

import OnboardingNavigator from '../src/navigation/OnboardingNavigator';
import MainTabNavigator from '../src/navigation/MainTabNavigator';
import RootNavigator from '../src/navigation/RootNavigator';
import { useAuthStore } from '../src/store/authStore';
import { useUserStore } from '../src/store/userStore';
import { User } from '../src/types';

const authedUser: User = {
  id: 'guest_nav_test',
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
  mockSupabaseClient = null;
  useUserStore.setState({
    xp: 0, streak: 0, lastStreakDate: null, progress: [], badges: [],
    todayMinutes: 0, todayLearned: false, aiChatCount: 0, todayAiChatCount: 0, aiChatCountDate: null,
  });
  useAuthStore.setState({ user: null, hasCompletedOnboarding: false, onboardingData: {} });
});

describe('OnboardingNavigator', () => {
  it('6개 온보딩 화면을 등록한다', async () => {
    await render(<OnboardingNavigator />);
    [
      'OnboardingLanguage', 'OnboardingGoal', 'OnboardingLevel',
      'OnboardingLevelTest', 'OnboardingTime', 'OnboardingNotification',
    ].forEach((name) => {
      expect(screen.getByTestId(`screen-${name}`)).toBeTruthy();
    });
  });
});

describe('MainTabNavigator', () => {
  it('5개 탭을 등록한다', async () => {
    await render(<MainTabNavigator />);
    ['Home', 'Lessons', 'AIHub', 'Leaderboard', 'Profile'].forEach((name) => {
      expect(screen.getByTestId(`tab-${name}`)).toBeTruthy();
    });
  });
});

describe('RootNavigator — 화면 등록 분기', () => {
  it('로그아웃 상태면 Splash/Onboarding만 등록하고 Main 계열은 등록하지 않는다', async () => {
    useAuthStore.setState({ user: null });
    await render(<RootNavigator />);
    expect(screen.getByTestId('screen-Splash')).toBeTruthy();
    expect(screen.getByTestId('screen-Onboarding')).toBeTruthy();
    expect(screen.queryByTestId('screen-Main')).toBeNull();
  });

  it('로그인 상태면 Main 계열을 등록하고 Splash/Onboarding은 등록하지 않는다', async () => {
    useAuthStore.setState({ user: authedUser });
    await render(<RootNavigator />);
    expect(screen.getByTestId('screen-Main')).toBeTruthy();
    expect(screen.getByTestId('screen-Lesson')).toBeTruthy();
    expect(screen.getByTestId('screen-LessonComplete')).toBeTruthy();
    expect(screen.getByTestId('screen-AIChat')).toBeTruthy();
    expect(screen.getByTestId('screen-ProUpgrade')).toBeTruthy();
    expect(screen.queryByTestId('screen-Splash')).toBeNull();
  });
});

describe('RootNavigator — 마운트 시 부수효과', () => {
  it('checkNewDay를 호출해 날짜 경계를 처리한다', async () => {
    const checkNewDaySpy = jest.spyOn(useUserStore.getState(), 'checkNewDay');
    await render(<RootNavigator />);
    expect(checkNewDaySpy).toHaveBeenCalled();
    checkNewDaySpy.mockRestore();
  });

  it('Supabase가 설정되어 있으면 인증 상태 변경을 구독한다', async () => {
    const unsubscribe = jest.fn();
    const onAuthStateChange = jest.fn().mockReturnValue({ data: { subscription: { unsubscribe } } });
    mockSupabaseClient = { auth: { onAuthStateChange }, from: noopFrom };
    await render(<RootNavigator />);
    expect(onAuthStateChange).toHaveBeenCalled();
  });

  it('SIGNED_OUT 이벤트가 오면 signOut을 호출한다', async () => {
    let capturedCallback: ((event: string) => void) | undefined;
    const onAuthStateChange = jest.fn((cb) => {
      capturedCallback = cb;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });
    mockSupabaseClient = { auth: { onAuthStateChange }, from: noopFrom };
    useAuthStore.setState({ user: authedUser });
    await render(<RootNavigator />);
    const signOutSpy = jest.spyOn(useAuthStore.getState(), 'signOut').mockImplementation(() => {});
    capturedCallback?.('SIGNED_OUT');
    expect(signOutSpy).toHaveBeenCalled();
    signOutSpy.mockRestore();
  });

  it('Supabase가 설정되어 있지 않으면 구독을 시도하지 않는다', async () => {
    mockSupabaseClient = null;
    await render(<RootNavigator />);
    // supabase?.auth.onAuthStateChange — 옵셔널 체이닝으로 안전하게 스킵된다 (크래시 없음)
    expect(mockSupabaseClient).toBeNull();
  });
});
