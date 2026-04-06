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
  friends: [
    '반가워요! 한국어 공부한 지 얼마나 됐어요? 😊',
    '오, 정말요? 저도 그거 좋아해요! 취미가 비슷하네요~\n[교정: 나는 좋아해 → 저는 좋아해요 (존댓말을 써야 더 자연스러워요)]',
    '한국에 온 이유가 뭐예요? 여행이에요, 아니면 공부하러 왔어요?',
    '와, 한국어 잘하시네요! 어떻게 공부하셨어요? 비법이 있어요? 👏\n[교정: 공부했어 → 공부하셨어요 (상대방 행동엔 존경 표현을 써요)]',
  ],
  shopping: [
    '이 색깔 어때요? 요즘 제일 잘 나가는 스타일이에요!\n[교정: 입어봐도 돼요? → 입어봐도 될까요? (더 공손한 표현이에요)]',
    '사이즈가 맞으시면 가격 깎아드릴게요! 얼마 드릴까요? 😊',
    '지금 세일 기간이라 20% 할인 돼요! 오늘만 특별 가격이에요~',
    '포장해드릴까요? 선물용으로 예쁘게 싸드릴 수 있어요!\n[교정: 이거 주세요 → 이걸로 할게요 (쇼핑할 때 자연스러운 표현이에요)]',
  ],
  kdrama: [
    '잠깐, 너 설마... 나한테 그런 말 하는 거야? 말도 안 돼!\n[교정: 저 몰라요? → 저를 모르세요? (목적격 조사 '를'을 붙여요)]',
    '...그럼 처음부터 다 알고 있었다는 거야? 어떻게 그럴 수가 있어!',
    '됐어, 이제 다 끝났어. 더 이상 변명하지 마!\n[교정: 착각했어요 → 착각하신 거 아닌가요? (더 자연스러운 의심 표현이에요)]',
    '...(한숨) 그래도 난 포기 못 해. 네가 뭐라고 해도.',
  ],
  restaurant: [
    '이 자리 어떠세요? 창가 자리도 있어요! 😊\n[교정: 메뉴판 주세요 → 메뉴 좀 볼 수 있을까요? (더 자연스러운 표현이에요)]',
    '오늘 삼겹살이 신선하게 들어왔어요! 추천 메뉴예요~',
    '반찬은 리필 가능해요! 더 필요하시면 말씀해주세요.',
    '계산서 드릴까요? 카드랑 현금 다 돼요!\n[교정: 비빔밥 하나요 → 비빔밥 하나 주세요 (주문할 때는 '주세요'를 붙여요)]',
  ],
  business: [
    '네, 말씀하신 제안서 잘 검토했습니다. 몇 가지 여쭤봐도 될까요?\n[교정: 잘 부탁합니다 → 잘 부탁드립니다 (비즈니스 상황엔 더 공손한 표현을 써요)]',
    '저희 측에서도 긍정적으로 검토하고 있습니다. 일정 조율이 필요할 것 같습니다.',
    '그 부분은 내부 승인이 필요합니다. 다음 주까지 답변 드릴 수 있을까요?\n[교정: 논의하고 싶습니다 → 논의드리고 싶습니다 (더 격식 있는 표현이에요)]',
    '오늘 미팅에 감사드립니다. 좋은 협력 관계가 되길 기대합니다!',
  ],
  topik: [
    '좋아요, 오늘은 환경 문제에 대해 이야기해 봅시다. 본인의 의견을 3-4문장으로 말씀해 보세요.\n[교정: '-을 것이다' 대신 '-을 것으로 보인다'처럼 추측 표현을 다양하게 써보세요]',
    '좋은 의견이에요! 다만 '-는지'를 활용해서 원인 분석을 추가해보세요.\n[교정: '-기 때문에' 중복 사용 → '-므로', '-아/어서'로 바꿔 다양하게 표현해요]',
    '논리 구조가 탄탄해요! 이제 반론도 언급해보세요. '물론 ~이지만, 그럼에도 불구하고 ~' 패턴을 써보세요.',
    '훌륭해요! TOPIK II 수준의 어휘를 잘 활용했어요. 다음엔 '사회 현상' 주제로 연습해봐요. 👏\n[교정: 고급 표현 팁 → '-에 따르면', '-ㄹ 뿐만 아니라'를 적극 활용하세요]',
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
