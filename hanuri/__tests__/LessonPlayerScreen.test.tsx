/**
 * LessonPlayerScreen 컴포넌트 테스트
 * - 골든패스: flashcard → quiz → fillblank → pronunciation → finishLesson (전 단계 순회)
 * - culture 단계가 있는 레슨의 인트로 렌더링 + 시작 전환
 * - 존재하지 않는 lessonId → notFound
 * - 발음 단계 에러 경로: 마이크 권한 거부
 */

import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('../src/services/supabase', () => ({ supabase: null }));

const mockReplace = jest.fn();
const mockGoBack = jest.fn();
let mockRouteParams: { lessonId: string } = { lessonId: 'l1u1l1' };
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ replace: mockReplace, goBack: mockGoBack }),
  useRoute: () => ({ params: mockRouteParams }),
}));

jest.mock('../src/utils/tts', () => ({ speakKorean: jest.fn() }));

jest.mock('../src/services/notificationService', () => ({
  sendLessonCompleteNotification: jest.fn().mockResolvedValue(undefined),
}));

const mockRecorder = {
  uri: 'file://mock-pron.m4a',
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
  assessPronunciation: jest.fn(),
}));

import LessonPlayerScreen from '../src/screens/lesson/LessonPlayerScreen';
import { useAuthStore } from '../src/store/authStore';
import { useUserStore } from '../src/store/userStore';
import { getLessonById } from '../src/data/lessons';
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
  mockRouteParams = { lessonId: 'l1u1l1' };
  useAuthStore.setState({ user: baseUser, hasCompletedOnboarding: true, onboardingData: {} });
  useUserStore.setState({
    xp: 0, streak: 0, lastStreakDate: null, progress: [], badges: [],
    todayMinutes: 0, todayLearned: false, aiChatCount: 0, todayAiChatCount: 0, aiChatCountDate: null,
  });
  (pronunciationService.assessPronunciation as jest.Mock).mockResolvedValue({
    transcript: '인식됨', score: 100, feedback: '완벽해요', wordMatches: [],
  });
  (expoAudio.requestRecordingPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
});

describe('LessonPlayerScreen — 존재하지 않는 레슨', () => {
  it('lessonNotFound 메시지를 렌더링한다', async () => {
    mockRouteParams = { lessonId: 'no-such-lesson' };
    await render(<LessonPlayerScreen />);
    expect(screen.getByText('Lesson not found.')).toBeTruthy();
  });
});

describe('LessonPlayerScreen — culture 단계가 있는 레슨', () => {
  beforeEach(() => {
    mockRouteParams = { lessonId: 'l3u4l1' };
  });

  it('상황 설명과 대화를 렌더링하고, 시작 탭 시 flashcard로 전환된다', async () => {
    await render(<LessonPlayerScreen />);
    expect(screen.getByText('Culture')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('btn-start-lesson'));
    await waitFor(() => {
      expect(screen.getByText('Flashcard')).toBeTruthy();
    });
  });
});

describe('LessonPlayerScreen — 발음 단계 에러 경로', () => {
  it('마이크 권한 거부 시 에러 메시지를 표시한다', async () => {
    (expoAudio.requestRecordingPermissionsAsync as jest.Mock).mockResolvedValueOnce({ granted: false });
    await render(<LessonPlayerScreen />);

    const lesson = getLessonById('l1u1l1')!;
    // flashcard 전부 넘기기
    for (let i = 0; i < lesson.vocabulary.length; i++) {
      await fireEvent.press(screen.getByTestId('btn-next-card'));
    }
    // quiz 전부 정답 선택 후 다음
    for (const card of lesson.vocabulary) {
      await fireEvent.press(screen.getByText(card.translations.en!));
      await fireEvent.press(screen.getByTestId('btn-next-quiz'));
    }
    // fillblank 전부 정답 선택 후 다음
    for (const fb of lesson.fillInBlanks ?? []) {
      await fireEvent.press(screen.getByText(fb.answer));
      const isLastFill = fb === (lesson.fillInBlanks ?? [])[(lesson.fillInBlanks ?? []).length - 1];
      const nextLabel = isLastFill ? 'Pronunciation →' : 'Next →';
      await fireEvent.press(screen.getByText(nextLabel));
    }

    await fireEvent.press(screen.getByText('🎤'));
    await waitFor(() => {
      expect(screen.getByText(/녹음 오류/)).toBeTruthy();
    });
  });
});

describe('LessonPlayerScreen — 전체 골든패스 (flashcard → quiz → fillblank → pronunciation → 완료)', () => {
  it('모든 단계를 정답으로 순회하면 finishLesson이 호출되어 LessonComplete로 이동한다', async () => {
    await render(<LessonPlayerScreen />);
    const lesson = getLessonById('l1u1l1')!;

    expect(screen.getByText('Flashcard')).toBeTruthy();

    // ── Flashcard: 끝까지 다음 카드 ──
    for (let i = 0; i < lesson.vocabulary.length; i++) {
      await fireEvent.press(screen.getByTestId('btn-next-card'));
    }

    await waitFor(() => expect(screen.getByText('Quiz')).toBeTruthy());

    // ── Quiz: 매번 정답(영어 의미) 선택 ──
    for (const card of lesson.vocabulary) {
      await fireEvent.press(screen.getByText(card.translations.en!));
      await fireEvent.press(screen.getByTestId('btn-next-quiz'));
    }

    await waitFor(() => expect(screen.getByText('Fill in Blank')).toBeTruthy());

    // ── Fill-in-blank: 매번 정답 선택 ──
    const fillBlanks = lesson.fillInBlanks ?? [];
    for (let i = 0; i < fillBlanks.length; i++) {
      await fireEvent.press(screen.getByText(fillBlanks[i].answer));
      const isLast = i === fillBlanks.length - 1;
      await fireEvent.press(screen.getByText(isLast ? 'Pronunciation →' : 'Next →'));
    }

    await waitFor(() => expect(screen.getByText('Pronunciation')).toBeTruthy());

    // ── Pronunciation: 단어마다 녹음 → 중지 → 다음 ──
    for (let i = 0; i < lesson.vocabulary.length; i++) {
      await fireEvent.press(screen.getByText('🎤'));
      expect(mockRecorder.record).toHaveBeenCalledTimes(i + 1);
      await fireEvent.press(screen.getByText('⏹'));
      const isLastWord = i === lesson.vocabulary.length - 1;
      await waitFor(() => {
        expect(screen.getByText(isLastWord ? 'K-Master! 🏆' : 'Next Word →')).toBeTruthy();
      });
      await fireEvent.press(screen.getByText(isLastWord ? 'K-Master! 🏆' : 'Next Word →'));
    }

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('LessonComplete', expect.objectContaining({
        xp: lesson.xpReward,
        score: 100,
      }));
    });
    expect(useUserStore.getState().progress).toEqual(
      expect.arrayContaining([expect.objectContaining({ lesson_id: 'l1u1l1', status: 'completed', score: 100 })])
    );
  });
});
