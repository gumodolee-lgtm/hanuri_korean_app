import { create } from 'zustand';
import { FREE_MAX_LEVEL as DEFAULT_FREE_MAX_LEVEL } from '../data/lessons';
import { FREE_DAILY_CHAT_LIMIT as DEFAULT_FREE_DAILY_CHAT_LIMIT } from '../data/scenarios';
import { fetchFreeMaxLevel, fetchFreeDailyChatLimit } from '../services/configService';

interface ConfigState {
  freeMaxLevel: number;
  freeDailyChatLimit: number;
  loadConfig: () => Promise<void>;
}

// 원격(app_config 테이블)에서 가져온 값이 적용되기 전까지는 앱 내 기본값을 사용한다.
// AsyncStorage에 persist하지 않음 — 매 앱 시작마다 최신 값을 다시 가져온다.
export const useConfigStore = create<ConfigState>((set) => ({
  freeMaxLevel: DEFAULT_FREE_MAX_LEVEL,
  freeDailyChatLimit: DEFAULT_FREE_DAILY_CHAT_LIMIT,
  loadConfig: async () => {
    const [freeMaxLevel, freeDailyChatLimit] = await Promise.all([
      fetchFreeMaxLevel(),
      fetchFreeDailyChatLimit(),
    ]);
    set({ freeMaxLevel, freeDailyChatLimit });
  },
}));
