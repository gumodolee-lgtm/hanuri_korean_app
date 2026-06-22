/**
 * SplashScreen 컴포넌트 테스트
 * - OAuth 성공 플로우(딥링크 파싱 등)는 범위 밖. Setup Required 가드,
 *   플랫폼별 렌더링, Start for Free 네비게이션만 다룬다.
 */

import React from 'react';
import { Alert, Platform } from 'react-native';
import { render, fireEvent, screen } from '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-apple-authentication', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
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

let mockIsConfigured = false;
jest.mock('../src/services/supabase', () => ({
  get supabase() {
    return mockIsConfigured ? { auth: { signInWithOAuth: jest.fn(), signInWithIdToken: jest.fn(), setSession: jest.fn() } } : null;
  },
  get isSupabaseConfigured() {
    return mockIsConfigured;
  },
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

import SplashScreen from '../src/screens/auth/SplashScreen';
import * as AppleAuthentication from 'expo-apple-authentication';

beforeEach(() => {
  mockIsConfigured = false;
  mockNavigate.mockClear();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  (Alert.alert as jest.Mock).mockRestore();
});

describe('SplashScreen — 렌더링', () => {
  it('로고와 슬로건, CTA 버튼들을 렌더링한다', async () => {
    await render(<SplashScreen />);
    expect(screen.getByText('HANURI')).toBeTruthy();
    expect(screen.getByText('Real Korean from K-Dramas & K-Pop')).toBeTruthy();
    expect(screen.getByTestId('btn-start-free')).toBeTruthy();
    expect(screen.getByTestId('btn-google-login')).toBeTruthy();
  });

  it('iOS에서는 Apple 로그인 버튼을 보여준다', async () => {
    Platform.OS = 'ios';
    await render(<SplashScreen />);
    expect(screen.getByText(/Continue with Apple/)).toBeTruthy();
    Platform.OS = 'android';
  });

  it('android에서는 Apple 로그인 버튼을 숨긴다', async () => {
    Platform.OS = 'android';
    await render(<SplashScreen />);
    expect(screen.queryByText(/Continue with Apple/)).toBeNull();
  });
});

describe('SplashScreen — Start for Free', () => {
  it('탭 시 Onboarding으로 navigate한다', async () => {
    await render(<SplashScreen />);
    await fireEvent.press(screen.getByTestId('btn-start-free'));
    expect(mockNavigate).toHaveBeenCalledWith('Onboarding');
  });
});

describe('SplashScreen — Supabase 미설정 가드', () => {
  it('Google 로그인 탭 시 Setup Required 알림을 띄운다', async () => {
    mockIsConfigured = false;
    await render(<SplashScreen />);
    await fireEvent.press(screen.getByTestId('btn-google-login'));
    expect(Alert.alert).toHaveBeenCalledWith(
      'Setup Required',
      expect.stringContaining('Google sign-in needs Supabase env vars')
    );
  });

  // Apple 버튼은 !isSupabaseConfigured일 때 disabled=true가 되어 fireEvent.press가
  // onPress를 트리거하지 않는다 (handleAppleLogin 내부 가드는 UI상 도달 불가능).
});

describe('SplashScreen — Apple 로그인 가용성 체크', () => {
  it('Supabase는 설정됐지만 기기에서 Apple Sign In을 쓸 수 없으면 실패 알림을 띄운다', async () => {
    mockIsConfigured = true;
    Platform.OS = 'ios';
    (AppleAuthentication.isAvailableAsync as jest.Mock).mockResolvedValueOnce(false);
    await render(<SplashScreen />);
    await fireEvent.press(screen.getByText(/Continue with Apple/));
    await screen.findByText(/Continue with Apple/);
    expect(Alert.alert).toHaveBeenCalledWith('Login Failed', 'Apple Sign In is not available on this device.');
    Platform.OS = 'android';
  });
});
