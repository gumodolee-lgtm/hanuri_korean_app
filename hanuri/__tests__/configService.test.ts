/**
 * configService 단위 테스트 — fetchFreeMaxLevel
 */

function makeBuilder(result: unknown) {
  const builder: Record<string, unknown> = {
    select: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    single: jest.fn(() => Promise.resolve(result)),
  };
  return builder;
}

let fromResult: unknown;
const fromMock = jest.fn(() => makeBuilder(fromResult));

let mockSupabaseClient: { from: typeof fromMock } | null = { from: fromMock };
jest.mock('../src/services/supabase', () => ({
  get supabase() {
    return mockSupabaseClient;
  },
}));

import { fetchFreeMaxLevel } from '../src/services/configService';
import { FREE_MAX_LEVEL } from '../src/data/lessons';

beforeEach(() => {
  mockSupabaseClient = { from: fromMock };
  fromMock.mockClear();
  fromResult = { data: null, error: null };
});

describe('configService — fetchFreeMaxLevel', () => {
  it('supabase가 없으면 앱 내 기본값을 반환한다', async () => {
    mockSupabaseClient = null;
    expect(await fetchFreeMaxLevel()).toBe(FREE_MAX_LEVEL);
  });

  it('app_config에 값이 있으면 해당 값을 숫자로 반환한다', async () => {
    fromResult = { data: { value: '4' }, error: null };
    expect(await fetchFreeMaxLevel()).toBe(4);
    expect(fromMock).toHaveBeenCalledWith('app_config');
  });

  it('값이 숫자로 변환되지 않으면 기본값을 반환한다', async () => {
    fromResult = { data: { value: 'not-a-number' }, error: null };
    expect(await fetchFreeMaxLevel()).toBe(FREE_MAX_LEVEL);
  });

  it('값이 0 이하이면 기본값을 반환한다', async () => {
    fromResult = { data: { value: '0' }, error: null };
    expect(await fetchFreeMaxLevel()).toBe(FREE_MAX_LEVEL);
  });

  it('에러가 있으면 기본값을 반환한다', async () => {
    fromResult = { data: null, error: { message: 'fail' } };
    expect(await fetchFreeMaxLevel()).toBe(FREE_MAX_LEVEL);
  });

  it('데이터가 없으면 기본값을 반환한다', async () => {
    fromResult = { data: null, error: null };
    expect(await fetchFreeMaxLevel()).toBe(FREE_MAX_LEVEL);
  });
});
