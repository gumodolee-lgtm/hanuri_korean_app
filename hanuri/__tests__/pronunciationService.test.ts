/**
 * pronunciationService 단위 테스트 (assessPronunciation / transcribeSpeech)
 * mockAssessment는 services.test.ts에서 별도로 다룬다.
 */

jest.mock('expo-file-system/legacy', () => ({
  readAsStringAsync: jest.fn().mockResolvedValue('base64data'),
  EncodingType: { Base64: 'base64' },
}));

const invokeMock = jest.fn();
let mockSupabaseClient: { functions: { invoke: typeof invokeMock } } | null = {
  functions: { invoke: invokeMock },
};

jest.mock('../src/services/supabase', () => ({
  get supabase() {
    return mockSupabaseClient;
  },
}));

import { assessPronunciation, transcribeSpeech } from '../src/services/pronunciationService';

beforeEach(() => {
  mockSupabaseClient = { functions: { invoke: invokeMock } };
  invokeMock.mockReset();
});

describe('assessPronunciation', () => {
  it('supabase가 없으면 mockAssessment 결과를 반환한다', async () => {
    mockSupabaseClient = null;
    const result = await assessPronunciation('uri://audio', '안녕하세요');
    expect(result.score).toBe(75);
    expect(invokeMock).not.toHaveBeenCalled();
  });

  it('supabase가 있으면 whisper-transcribe Edge Function을 호출하고 결과를 반환한다', async () => {
    invokeMock.mockResolvedValue({
      data: { transcript: '안녕하세요', score: 88, feedback: '좋아요', wordMatches: [] },
      error: null,
    });
    const result = await assessPronunciation('uri://audio', '안녕하세요', undefined);
    expect(invokeMock).toHaveBeenCalledWith('whisper-transcribe', {
      body: { audioBase64: 'base64data', targetText: '안녕하세요', feedbackStrings: undefined },
    });
    expect(result).toEqual({ transcript: '안녕하세요', score: 88, feedback: '좋아요', wordMatches: [] });
  });

  it('Edge Function이 에러를 반환하면 예외를 던진다', async () => {
    invokeMock.mockResolvedValue({ data: null, error: new Error('서버 오류') });
    await expect(assessPronunciation('uri://audio', '안녕')).rejects.toThrow('서버 오류');
  });
});

describe('transcribeSpeech', () => {
  it('supabase가 없으면 빈 문자열을 반환한다', async () => {
    mockSupabaseClient = null;
    expect(await transcribeSpeech('uri://audio')).toBe('');
  });

  it('성공하면 transcript를 반환한다', async () => {
    invokeMock.mockResolvedValue({ data: { transcript: '안녕' }, error: null });
    expect(await transcribeSpeech('uri://audio')).toBe('안녕');
  });

  it('transcript가 없으면 빈 문자열을 반환한다', async () => {
    invokeMock.mockResolvedValue({ data: {}, error: null });
    expect(await transcribeSpeech('uri://audio')).toBe('');
  });

  it('에러가 있으면 빈 문자열을 반환한다', async () => {
    invokeMock.mockResolvedValue({ data: null, error: new Error('실패') });
    expect(await transcribeSpeech('uri://audio')).toBe('');
  });

  it('예외가 발생해도 빈 문자열을 반환한다', async () => {
    invokeMock.mockRejectedValue(new Error('네트워크 오류'));
    expect(await transcribeSpeech('uri://audio')).toBe('');
  });
});
