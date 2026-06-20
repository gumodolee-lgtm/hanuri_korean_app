/**
 * AIChatScreen 컴포넌트 테스트
 * - 골든패스: 메시지 전송 → AI 응답 → XP 적립
 * - 무료 한도 도달 시 ProUpgrade 이동
 * - 전송 실패 시 connectionError 말풍선
 * - 음성 입력: 녹음 시작/중지 → 텍스트 입력창 채움, 실패 시 Alert(이번에 고친 i18n 키 회귀 테스트)
 */

import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('../src/services/supabase', () => ({ supabase: null }));

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
let mockRouteParams: { scenarioId?: string } = {};
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useRoute: () => ({ params: mockRouteParams }),
}));

jest.mock('../src/utils/tts', () => ({ speakKorean: jest.fn() }));

jest.mock('../src/services/aiService', () => ({
  ...jest.requireActual('../src/services/aiService'),
  sendMessage: jest.fn(),
}));

const mockRecorder = {
  uri: 'file://mock-recording.m4a',
  stop: jest.fn().mockResolvedValue(undefined),
  prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
  record: jest.fn(),
};
jest.mock('expo-audio', () => ({
  useAudioRecorder: () => mockRecorder,
  RecordingPresets: { HIGH_QUALITY: {} },
  requestRecordingPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/services/pronunciationService', () => ({
  transcribeSpeech: jest.fn(),
}));

import AIChatScreen from '../src/screens/ai-chat/AIChatScreen';
import { useAuthStore } from '../src/store/authStore';
import { useUserStore } from '../src/store/userStore';
import * as aiService from '../src/services/aiService';
import * as pronunciationService from '../src/services/pronunciationService';
import * as expoAudio from 'expo-audio';
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
  jest.clearAllMocks();
  mockRouteParams = { scenarioId: 'cafe' };
  useAuthStore.setState({ user: baseUser, hasCompletedOnboarding: true, onboardingData: {} });
  useUserStore.setState({
    xp: 0, streak: 0, lastStreakDate: null, progress: [], badges: [],
    todayMinutes: 0, todayLearned: false, aiChatCount: 0, todayAiChatCount: 0, aiChatCountDate: null,
  });
});

describe('AIChatScreen — 골든패스', () => {
  it('시나리오 시작 메시지와 퀵 리플라이를 렌더링한다', async () => {
    await render(<AIChatScreen />);
    expect(screen.getByText('어서오세요! 주문 하시겠어요? 😊')).toBeTruthy();
    expect(screen.getByText('아이스 아메리카노 주세요')).toBeTruthy();
  });

  it('메시지 전송 시 AI 응답을 받고 XP가 2점 적립된다', async () => {
    (aiService.sendMessage as jest.Mock).mockResolvedValue('아이스로 드릴까요?');
    await render(<AIChatScreen />);
    await fireEvent.changeText(screen.getByTestId('input-chat'), '아메리카노 주세요');
    await fireEvent.press(screen.getByTestId('btn-send'));
    await waitFor(() => {
      expect(screen.getByText('아이스로 드릴까요?')).toBeTruthy();
    });
    expect(useUserStore.getState().xp).toBe(2);
    expect(useUserStore.getState().aiChatCount).toBe(1);
    expect(useUserStore.getState().todayAiChatCount).toBe(1);
  });

  it('알 수 없는 scenarioId면 notFound 메시지를 렌더링한다', async () => {
    mockRouteParams = { scenarioId: 'no-such-scenario' };
    await render(<AIChatScreen />);
    expect(screen.getByText('Scenario not found.')).toBeTruthy();
  });
});

describe('AIChatScreen — 무료 한도 / 에러', () => {
  it('무료 유저가 일일 한도(3회) 도달 시 전송 대신 ProUpgrade로 이동한다', async () => {
    useUserStore.setState({ todayAiChatCount: 3 });
    await render(<AIChatScreen />);
    await fireEvent.changeText(screen.getByTestId('input-chat'), '안녕하세요');
    await fireEvent.press(screen.getByTestId('btn-send'));
    expect(mockNavigate).toHaveBeenCalledWith('ProUpgrade');
    expect(aiService.sendMessage).not.toHaveBeenCalled();
  });

  it('전송 실패 시 connectionError 말풍선을 표시한다', async () => {
    (aiService.sendMessage as jest.Mock).mockRejectedValue(new Error('network down'));
    await render(<AIChatScreen />);
    await fireEvent.changeText(screen.getByTestId('input-chat'), '안녕하세요');
    await fireEvent.press(screen.getByTestId('btn-send'));
    await waitFor(() => {
      expect(screen.getByText('Connection error. Please try again. 😅')).toBeTruthy();
    });
  });
});

describe('AIChatScreen — 음성 입력 (i18n 회귀 테스트: voiceErrorMsg)', () => {
  it('마이크 탭 → 녹음 시작 → 다시 탭하면 중지 후 인식된 텍스트를 입력창에 채운다', async () => {
    (pronunciationService.transcribeSpeech as jest.Mock).mockResolvedValue('안녕하세요');
    await render(<AIChatScreen />);
    const micBtn = screen.getByText('🎤');
    await fireEvent.press(micBtn);
    expect(mockRecorder.record).toHaveBeenCalled();

    await fireEvent.press(screen.getByText('⏹'));
    await waitFor(() => {
      expect(screen.getByTestId('input-chat').props.value).toBe('안녕하세요');
    });
  });

  it('인식된 텍스트가 비어있으면 voiceErrorMsg Alert을 띄운다', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    (pronunciationService.transcribeSpeech as jest.Mock).mockResolvedValue('');
    await render(<AIChatScreen />);
    await fireEvent.press(screen.getByText('🎤'));
    await fireEvent.press(screen.getByText('⏹'));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Couldn't process your voice. Please try again.");
    });
  });

  it('마이크 권한 요청 실패(에러) 시 voiceErrorMsg Alert을 띄운다', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    (expoAudio.requestRecordingPermissionsAsync as jest.Mock).mockRejectedValue(new Error('denied'));
    await render(<AIChatScreen />);
    await fireEvent.press(screen.getByText('🎤'));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Couldn't process your voice. Please try again.");
    });
  });
});
