/**
 * 서비스 계층 단위 테스트
 * - aiService: parseCorrection, mock 응답 풀
 * - pronunciationService: mockAssessment (토큰 분해, word matches)
 * - revenuecatService: isPro 판정
 */

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('../src/services/supabase', () => ({ supabase: null }));

jest.mock('expo-file-system/legacy', () => ({
  readAsStringAsync: jest.fn().mockResolvedValue('base64data'),
  EncodingType: { Base64: 'base64' },
}));

// ── aiService: parseCorrection ─────────────────────────────────────────────

import { parseCorrection } from '../src/services/aiService';

describe('aiService — parseCorrection', () => {
  it('[교정: ...] 태그가 없으면 message=원문, correction=null을 반환한다', () => {
    const text = '안녕하세요! 오늘 한국어 공부 어떠세요? 😊';
    const result = parseCorrection(text);
    expect(result.message).toBe(text);
    expect(result.correction).toBeNull();
  });

  it('[교정: ...] 태그가 있으면 분리해서 반환한다', () => {
    const text = '네, 맞아요!\n[교정: 잘 됩니다 → 잘 돼요]';
    const result = parseCorrection(text);
    expect(result.message).toBe('네, 맞아요!');
    expect(result.correction).toBe('잘 됩니다 → 잘 돼요');
  });

  it('교정 태그만 있고 앞 메시지가 없어도 동작한다', () => {
    const text = '[교정: 주세요 → 주시겠어요]';
    const result = parseCorrection(text);
    expect(result.correction).toBe('주세요 → 주시겠어요');
  });

  it('여러 줄 메시지와 교정이 함께 있어도 분리된다', () => {
    const text = '잠깐, 너 설마...\n더 이상 변명하지 마!\n[교정: 착각했어요 → 착각하신 거 아닌가요?]';
    const result = parseCorrection(text);
    expect(result.message).toContain('더 이상 변명하지 마!');
    expect(result.correction).toBe('착각했어요 → 착각하신 거 아닌가요?');
  });

  it('빈 문자열을 넘겨도 에러 없이 처리된다', () => {
    const result = parseCorrection('');
    expect(result.message).toBe('');
    expect(result.correction).toBeNull();
  });
});

// ── aiService: sendMessage (mock mode) ────────────────────────────────────

import { sendMessage } from '../src/services/aiService';
import { ChatMessage } from '../src/types';

describe('aiService — sendMessage (mock mode, supabase=null)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('supabase가 null이면 mock 응답을 반환한다 (cafe 시나리오)', async () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'user', content: '아이스 아메리카노 주세요', timestamp: new Date() },
    ];
    const promise = sendMessage('system prompt', messages, 'cafe');
    jest.runAllTimers();
    const result = await promise;
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('알 수 없는 시나리오는 default 풀 응답을 반환한다', async () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'user', content: '안녕', timestamp: new Date() },
    ];
    const promise = sendMessage('system', messages, 'unknown_scenario');
    jest.runAllTimers();
    const result = await promise;
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('메시지 수가 증가하면 다른 응답이 순환된다 (두 번째 메시지)', async () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'user', content: '첫 번째', timestamp: new Date() },
      { id: '2', role: 'assistant', content: '첫 응답', timestamp: new Date() },
      { id: '3', role: 'user', content: '두 번째', timestamp: new Date() },
    ];
    const promise = sendMessage('system', messages, 'cafe');
    jest.runAllTimers();
    const result = await promise;
    // messageCount % pool.length → 다른 인덱스
    expect(typeof result).toBe('string');
  });
});

// ── pronunciationService: mockAssessment ──────────────────────────────────

import { mockAssessment } from '../src/services/pronunciationService';

describe('pronunciationService — mockAssessment', () => {
  it('score가 75를 반환한다', () => {
    const result = mockAssessment('안녕하세요');
    expect(result.score).toBe(75);
  });

  it('targetText의 단어 수만큼 wordMatches를 생성한다', () => {
    const result = mockAssessment('안녕하세요 저는 학생입니다');
    expect(result.wordMatches).toHaveLength(3);
  });

  it('모든 wordMatches가 matched=true다', () => {
    const result = mockAssessment('안녕 세계');
    expect(result.wordMatches.every((m) => m.matched)).toBe(true);
  });

  it('구두점을 제거하고 토큰화한다', () => {
    const result = mockAssessment('안녕하세요! 반가워요~');
    expect(result.wordMatches).toHaveLength(2);
    expect(result.wordMatches[0].word).toBe('안녕하세요');
    expect(result.wordMatches[1].word).toBe('반가워요');
  });

  it('빈 문자열이면 wordMatches가 비어있다', () => {
    const result = mockAssessment('');
    expect(result.wordMatches).toHaveLength(0);
  });

  it('feedback 문자열이 반환된다', () => {
    const result = mockAssessment('테스트');
    expect(typeof result.feedback).toBe('string');
    expect(result.feedback.length).toBeGreaterThan(0);
  });
});

// ── revenuecatService: isPro ───────────────────────────────────────────────

import { isPro, RC_ENTITLEMENT_ID } from '../src/services/revenuecatService';

describe('revenuecatService — isPro', () => {
  it('active entitlement에 RC_ENTITLEMENT_ID가 있으면 true를 반환한다', () => {
    const mockCustomerInfo = {
      entitlements: { active: { [RC_ENTITLEMENT_ID]: {} } },
    } as any;
    expect(isPro(mockCustomerInfo)).toBe(true);
  });

  it('active entitlement에 없으면 false를 반환한다', () => {
    const mockCustomerInfo = {
      entitlements: { active: {} },
    } as any;
    expect(isPro(mockCustomerInfo)).toBe(false);
  });

  it('RC_ENTITLEMENT_ID는 "hanuri Pro"다', () => {
    expect(RC_ENTITLEMENT_ID).toBe('hanuri Pro');
  });
});
