import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';
const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY') ?? '';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  systemPrompt: string;
  messages: ChatMessage[];
  scenarioId: string;
}

const MOCK_RESPONSES: Record<string, string[]> = {
  cafe: [
    '어떤 음료 드시겠어요? 아이스로 드릴까요, 따뜻하게 드릴까요? ☕',
    '사이즈는 어떻게 하시겠어요? 레귤러와 라지 중에서 선택해주세요!',
    '이름이 어떻게 되세요? 컵에 써드릴게요 😊\n[교정: 주문할게요 → 주문하겠습니다 (더 공손한 표현이에요!)]',
  ],
  default: [
    '안녕하세요! 오늘 한국어 공부 어떠세요? 😊',
    '네, 맞아요! 정말 잘 하셨어요! 계속 연습해봐요~',
    '와, 한국어 실력이 많이 늘었네요! 정말 대단해요! 👏',
  ],
};

function getMockResponse(scenarioId: string, count: number): string {
  const pool = MOCK_RESPONSES[scenarioId] ?? MOCK_RESPONSES.default;
  return pool[count % pool.length];
}

async function callClaude(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

async function callOpenAI(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 300,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const body: RequestBody = await req.json();
    const { systemPrompt, messages, scenarioId } = body;

    if (!systemPrompt || !messages) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    let reply: string;

    if (ANTHROPIC_KEY) {
      reply = await callClaude(systemPrompt, messages);
    } else if (OPENAI_KEY) {
      reply = await callOpenAI(systemPrompt, messages);
    } else {
      const userCount = messages.filter((m) => m.role === 'user').length;
      reply = getMockResponse(scenarioId, userCount - 1);
    }

    return new Response(JSON.stringify({ reply }), {
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
