import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabase';

// 녹음은 LessonPlayerScreen의 useAudioRecorder hook이 담당
// 이 파일은 채점(assessPronunciation)만 처리

export interface PronunciationResult {
  transcript: string;
  score: number;
  feedback: string;
  wordMatches: WordMatch[];
}

export interface WordMatch {
  word: string;
  matched: boolean;
}

export interface PronFeedbackStrings {
  perfect: string;
  good: string;
  practice: string;
  tryAgain: string;
  error: string;
}

// ─── 발음 평가 (Edge Function 호출) ──────────────────────────────────────────

export async function assessPronunciation(
  audioUri: string,
  targetText: string,
  feedbackStrings?: PronFeedbackStrings,
): Promise<PronunciationResult> {
  if (!supabase) {
    return mockAssessment(targetText, feedbackStrings);
  }

  const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
    encoding: 'base64',
  });

  const { data, error } = await supabase.functions.invoke('whisper-transcribe', {
    body: { audioBase64, targetText, feedbackStrings },
  });

  if (error) throw error;
  return data as PronunciationResult;
}

// ─── 음성 → 텍스트 변환 (AI 챗 음성 입력용) ──────────────────────────────────

export async function transcribeSpeech(audioUri: string): Promise<string> {
  if (!supabase) return '';
  try {
    const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: 'base64',
    });
    const { data, error } = await supabase.functions.invoke('whisper-transcribe', {
      body: { audioBase64, targetText: '', feedbackStrings: null },
    });
    if (error) return '';
    return (data as PronunciationResult).transcript ?? '';
  } catch {
    return '';
  }
}

// ─── Mock (Supabase 미설정 환경) ──────────────────────────────────────────────

export function mockAssessment(targetText: string, _feedbackStrings?: PronFeedbackStrings): PronunciationResult {
  const tokens = targetText.replace(/[.,!?~]/g, '').trim().toLowerCase().split(/\s+/).filter(Boolean);
  const wordMatches: WordMatch[] = tokens.map((word) => ({ word, matched: true }));
  return {
    transcript: '',
    score: 75,
    feedback: '🎤 데모 모드: Supabase 설정 시 실제 발음 채점이 가능합니다.',
    wordMatches,
  };
}
