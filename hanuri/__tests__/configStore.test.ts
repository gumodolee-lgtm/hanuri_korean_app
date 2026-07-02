/**
 * configStore 단위 테스트
 */

jest.mock('../src/services/configService', () => ({
  fetchFreeMaxLevel: jest.fn(),
  fetchFreeDailyChatLimit: jest.fn(),
}));

import { useConfigStore } from '../src/store/configStore';
import { fetchFreeMaxLevel, fetchFreeDailyChatLimit } from '../src/services/configService';
import { FREE_MAX_LEVEL } from '../src/data/lessons';
import { FREE_DAILY_CHAT_LIMIT } from '../src/data/scenarios';

beforeEach(() => {
  useConfigStore.setState({ freeMaxLevel: FREE_MAX_LEVEL, freeDailyChatLimit: FREE_DAILY_CHAT_LIMIT });
});

describe('configStore', () => {
  it('초기값은 앱 내 기본 FREE_MAX_LEVEL이다', () => {
    expect(useConfigStore.getState().freeMaxLevel).toBe(FREE_MAX_LEVEL);
  });

  it('초기값은 앱 내 기본 FREE_DAILY_CHAT_LIMIT이다', () => {
    expect(useConfigStore.getState().freeDailyChatLimit).toBe(FREE_DAILY_CHAT_LIMIT);
  });

  it('loadConfig 호출 시 원격 값으로 갱신된다', async () => {
    (fetchFreeMaxLevel as jest.Mock).mockResolvedValueOnce(4);
    (fetchFreeDailyChatLimit as jest.Mock).mockResolvedValueOnce(5);
    await useConfigStore.getState().loadConfig();
    expect(useConfigStore.getState().freeMaxLevel).toBe(4);
    expect(useConfigStore.getState().freeDailyChatLimit).toBe(5);
  });
});
