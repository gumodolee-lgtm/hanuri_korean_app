import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY') ?? '';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WordMatch {
  word: string;
  matched: boolean;
}

interface TranscribeResult {
  transcript: string;
  score: number;
  feedback: string;
  wordMatches: WordMatch[];
}

interface FeedbackStrings {
  perfect: string;
  good: string;
  practice: string;
  tryAgain: string;
  error: string;
}

function normalizeKorean(text: string): string {
  return text.replace(/[.,!?~]/g, '').trim().toLowerCase();
}

function tokenize(text: string): string[] {
  return normalizeKorean(text).split(/\s+/).filter(Boolean);
}

function scoreTranscript(transcript: string, target: string): { score: number; wordMatches: WordMatch[] } {
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

function buildFeedback(
  score: number,
  wordMatches: WordMatch[],
  strings: FeedbackStrings
): string {
  if (score >= 90) return strings.perfect;
  if (score >= 70) {
    const wrong = wordMatches.filter((w) => !w.matched).map((w) => w.word);
    return strings.good.replace('{words}', wrong.slice(0, 2).join(', '));
  }
  if (score >= 40) {
    const wrong = wordMatches.filter((w) => !w.matched).map((w) => w.word);
    return strings.practice.replace('{words}', wrong.slice(0, 3).join(', '));
  }
  return strings.tryAgain;
}

function mockResult(targetText: string): TranscribeResult {
  const tokens = tokenize(targetText);
  const wordMatches: WordMatch[] = tokens.map((word) => ({ word, matched: true }));
  return {
    transcript: '',
    score: 75,
    feedback: '🎤 데모 모드: API 키 설정 시 실제 발음 채점이 가능합니다.',
    wordMatches,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const body = await req.json();
    const { audioBase64, targetText, feedbackStrings } = body;

    if (!targetText) {
      return new Response(JSON.stringify({ error: 'Missing targetText' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // API 키 없으면 mock 반환
    if (!OPENAI_KEY || !audioBase64) {
      return new Response(JSON.stringify(mockResult(targetText)), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // base64 → Uint8Array → Blob
    const binaryStr = atob(audioBase64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const formData = new FormData();
    formData.append('file', new Blob([bytes], { type: 'audio/m4a' }), 'recording.m4a');
    formData.append('model', 'whisper-1');
    formData.append('language', 'ko');
    formData.append('response_format', 'json');

    const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_KEY}` },
      body: formData,
    });

    if (!whisperRes.ok) {
      const err = await whisperRes.text();
      throw new Error(`Whisper API ${whisperRes.status}: ${err}`);
    }

    const whisperData = await whisperRes.json();
    const transcript: string = (whisperData.text ?? '').trim();

    const { score, wordMatches } = scoreTranscript(transcript, targetText);
    const feedback = buildFeedback(score, wordMatches, feedbackStrings ?? {
      perfect: '완벽해요! 발음이 정확합니다. 🎉',
      good: '잘했어요! "{words}" 부분을 더 연습해보세요. ⭐',
      practice: '조금 더 연습해봐요. "{words}"에 집중하세요. 💪',
      tryAgain: '다시 한번 천천히 따라 읽어보세요. 화이팅! 🔄',
      error: '오류가 발생했습니다.',
    });

    const result: TranscribeResult = { transcript, score, feedback, wordMatches };

    return new Response(JSON.stringify(result), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
