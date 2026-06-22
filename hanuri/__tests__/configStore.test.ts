/**
 * configStore 단위 테스트
 */

jest.mock('../src/services/configService', () => ({
  fetchFreeMaxLevel: jest.fn(),
}));

import { useConfigStore } from '../src/store/configStore';
import { fetchFreeMaxLevel } from '../src/services/configService';
import { FREE_MAX_LEVEL } from '../src/data/lessons';

beforeEach(() => {
  useConfigStore.setState({ freeMaxLevel: FREE_MAX_LEVEL });
});

describe('configStore', () => {
  it('초기값은 앱 내 기본 FREE_MAX_LEVEL이다', () => {
    expect(useConfigStore.getState().freeMaxLevel).toBe(FREE_MAX_LEVEL);
  });

  it('loadConfig 호출 시 원격 값으로 갱신된다', async () => {
    (fetchFreeMaxLevel as jest.Mock).mockResolvedValueOnce(4);
    await useConfigStore.getState().loadConfig();
    expect(useConfigStore.getState().freeMaxLevel).toBe(4);
  });
});
