import { ChatMessage } from '../types';

// ⚠️ PRODUCTION WARNING: EXPO_PUBLIC_* 변수는 앱 번들에서 추출 가능합니다.
// 프로덕션 배포 시 반드시 백엔드 프록시를 통해 API를 호출하세요.
// 현재는 개발/데모 모드에서만 사용합니다. 키가 비어있으면 mock 모드로 동작합니다.
const ANTHROPIC_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';
const OPENAI_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';

// ─── Mock responses for offline/dev mode ─────────────────────────────────────

const MOCK_RESPONSES: Record<string, string[]> = {
  cafe: [
    '어떤 음료 드시겠어요? 아이스로 드릴까요, 따뜻하게 드릴까요? ☕',
    '사이즈는 어떻게 하시겠어요? 레귤러와 라지 중에서 선택해주세요!',
    '이름이 어떻게 되세요? 컵에 써드릴게요 😊\n[교정: 주문할게요 → 주문하겠습니다 (더 공손한 표현이에요!)]',
    '네, 잠시만 기다려주세요! 금방 나올 거예요~',
  ],
  directions: [
    '아, 거기요? 저도 그쪽으로 가는데 같이 가실래요? 😊',
    '이 길로 쭉 직진하시다가 편의점 보이면 왼쪽으로 꺾으시면 돼요!\n[교정: 어디 있어요? → 어디에 있어요? (자연스러운 표현이에요)]',
    '도보로 5분 정도 걸려요. 지하철역도 근처에 있으니 참고하세요!',
  ],
  default: [
    '안녕하세요! 오늘 한국어 공부 어떠세요? 😊\n[교정: 잘 됩니다 → 잘 돼요 (구어체로 더 자연스러워요!)]',
    '네, 맞아요! 정말 잘 하셨어요! 계속 연습해봐요~',
    '조금 더 자세히 말씀해주시겠어요? 잘 이해가 안 됐어요.',
    '와, 한국어 실력이 많이 늘었네요! 정말 대단해요! 👏\n[교정: 배울 거예요 → 배울 것 같아요 (더 자연스러운 추측 표현이에요)]',
    '맞아요, 한국어가 어렵지만 재미있죠? 꾸준히 하면 금방 늘어요!',
  ],
};

function getMockResponse(scenarioId: string, messageCount: number): string {
  const pool = MOCK_RESPONSES[scenarioId] ?? MOCK_RESPONSES.default;
  return pool[messageCount % pool.length];
}

// ─── Claude API ───────────────────────────────────────────────────────────────

async function callClaude(
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<string> {
  const body = {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  };

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Claude API error ${res.status}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

// ─── OpenAI API ───────────────────────────────────────────────────────────────

async function callOpenAI(
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<string> {
  const body = {
    model: 'gpt-4o-mini',
    max_tokens: 300,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function sendMessage(
  systemPrompt: string,
  messages: ChatMessage[],
  scenarioId: string
): Promise<string> {
  // Try Claude first
  if (ANTHROPIC_KEY) {
    return callClaude(systemPrompt, messages);
  }
  // Try OpenAI second
  if (OPENAI_KEY) {
    return callOpenAI(systemPrompt, messages);
  }
  // Demo mode: return mock response
  const userMessageCount = messages.filter((m) => m.role === 'user').length;
  return new Promise((resolve) =>
    setTimeout(() => resolve(getMockResponse(scenarioId, userMessageCount - 1)), 800)
  );
}

export function parseCorrection(text: string): { message: string; correction: string | null } {
  const match = text.match(/^([\s\S]*?)(\[교정:[\s\S]*\])?\s*$/);
  if (!match) return { message: text, correction: null };
  const message = match[1]?.trim() ?? text;
  const correction = match[2]?.replace('[교정:', '').replace(']', '').trim() ?? null;
  return { message, correction };
}
