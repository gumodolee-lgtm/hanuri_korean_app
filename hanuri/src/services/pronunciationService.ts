import { AudioModule, RecordingPresets } from 'expo-audio';
import type { AudioRecorder } from 'expo-audio';
import * as FileSystem from 'expo-file-system';

// Key is only read in __DEV__ builds — production always falls back to mock mode.
const OPENAI_KEY = __DEV__ ? (process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '') : '';

export interface PronunciationResult {
  transcript: string;
  score: number;       // 0–100
  feedback: string;
  wordMatches: WordMatch[];
}

export interface WordMatch {
  word: string;
  matched: boolean;
}

// ─── 녹음 ────────────────────────────────────────────────────

let recordingInstance: AudioRecorder | null = null;

export async function startRecording(): Promise<void> {
  // 이전 녹음이 남아있으면 정리 후 시작 (리소스 릭 방지)
  if (recordingInstance) {
    await stopRecording();
  }
  await AudioModule.requestRecordingPermissionsAsync();
  await AudioModule.setAudioModeAsync({
    allowsRecording: true,
    playsInSilentMode: true,
  });
  // AudioRecorder is exported as 'export type' in expo-audio typedefs but is a runtime class
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { AudioRecorder: AudioRecorderClass } = require('expo-audio') as { AudioRecorder: new (preset: unknown) => AudioRecorder };
  recordingInstance = new AudioRecorderClass(RecordingPresets.HIGH_QUALITY);
  recordingInstance.record();
}

export async function stopRecording(): Promise<string | null> {
  if (!recordingInstance) return null;
  await recordingInstance.stop();
  const uri = recordingInstance.uri;
  recordingInstance = null;
  await AudioModule.setAudioModeAsync({ allowsRecording: false });
  return uri ?? null;
}

// ─── Whisper STT ──────────────────────────────────────────────

async function transcribeWithWhisper(audioUri: string): Promise<string> {
  const fileInfo = await FileSystem.getInfoAsync(audioUri);
  if (!fileInfo.exists) throw new Error('Audio file not found');

  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    name: 'recording.m4a',
    type: 'audio/m4a',
  } as unknown as Blob);
  formData.append('model', 'whisper-1');
  formData.append('language', 'ko');
  formData.append('response_format', 'json');

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Whisper API error ${res.status}`);
  }

  const data = await res.json();
  return (data.text ?? '').trim();
}

// ─── 채점 로직 ────────────────────────────────────────────────

function normalizeKorean(text: string): string {
  return text.replace(/[.,!?~]/g, '').trim().toLowerCase();
}

function tokenize(text: string): string[] {
  return normalizeKorean(text).split(/\s+/).filter(Boolean);
}

function scoreTranscript(transcript: string, target: string): {
  score: number;
  wordMatches: WordMatch[];
} {
  const targetTokens = tokenize(target);
  const transcriptTokens = tokenize(transcript);

  let matched = 0;
  const wordMatches: WordMatch[] = targetTokens.map((word) => {
    const found = transcriptTokens.some(
      (t) => t === word || t.includes(word) || word.includes(t)
    );
    if (found) matched++;
    return { word, matched: found };
  });

  const score = targetTokens.length > 0
    ? Math.round((matched / targetTokens.length) * 100)
    : 0;

  return { score, wordMatches };
}

export interface PronFeedbackStrings {
  perfect: string;
  good: string;    // template: {words}
  practice: string; // template: {words}
  tryAgain: string;
}

const DEFAULT_FEEDBACK: PronFeedbackStrings = {
  perfect: '완벽해요! 발음이 정확합니다. 🎉',
  good: '잘했어요! "{words}" 부분을 더 연습해보세요. ⭐',
  practice: '조금 더 연습해봐요. "{words}"에 집중하세요. 💪',
  tryAgain: '다시 한번 천천히 따라 읽어보세요. 화이팅! 🔄',
};

function fillWords(template: string, words: string): string {
  return template.replace('{words}', words);
}

function buildFeedback(score: number, wordMatches: WordMatch[], strings: PronFeedbackStrings = DEFAULT_FEEDBACK): string {
  if (score >= 90) return strings.perfect;
  if (score >= 70) {
    const wrong = wordMatches.filter((w) => !w.matched).map((w) => w.word);
    return fillWords(strings.good, wrong.slice(0, 2).join(', '));
  }
  if (score >= 40) {
    const wrong = wordMatches.filter((w) => !w.matched).map((w) => w.word);
    return fillWords(strings.practice, wrong.slice(0, 3).join(', '));
  }
  return strings.tryAgain;
}

// ─── 공개 API ─────────────────────────────────────────────────

export async function assessPronunciation(
  audioUri: string,
  targetText: string,
  feedbackStrings?: PronFeedbackStrings,
): Promise<PronunciationResult> {
  // API 키가 없으면 모의 결과 반환
  if (!OPENAI_KEY) {
    return mockAssessment(targetText, feedbackStrings);
  }

  const transcript = await transcribeWithWhisper(audioUri);
  const { score, wordMatches } = scoreTranscript(transcript, targetText);
  const feedback = buildFeedback(score, wordMatches, feedbackStrings);

  return { transcript, score, feedback, wordMatches };
}

function mockAssessment(targetText: string, feedbackStrings?: PronFeedbackStrings): PronunciationResult {
  // No API key — return a clear "unavailable" result instead of fake random scores.
  const tokens = tokenize(targetText);
  const wordMatches: WordMatch[] = tokens.map((word) => ({ word, matched: false }));
  const feedback = feedbackStrings?.tryAgain
    ? feedbackStrings.tryAgain
    : '🎤 발음 평가 데모 모드입니다. 실제 채점은 OpenAI Whisper API 키 설정 후 사용 가능합니다.';
  return { transcript: '', score: 0, feedback, wordMatches };
}
