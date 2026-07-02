import { supabase } from './supabase';
import { FREE_MAX_LEVEL as DEFAULT_FREE_MAX_LEVEL } from '../data/lessons';
import { FREE_DAILY_CHAT_LIMIT as DEFAULT_FREE_DAILY_CHAT_LIMIT } from '../data/scenarios';

// app_config 테이블에서 키-값을 조회한다. Supabase 미설정/조회 실패 시 앱 내 기본값으로 안전하게 폴백한다.
async function fetchConfigValue(key: string): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', key)
    .single();
  if (error || !data) return null;
  return data.value;
}

// 양의 정수 설정값 조회 — 미설정/파싱 실패 시 기본값 폴백
async function fetchPositiveIntConfig(key: string, defaultValue: number): Promise<number> {
  const raw = await fetchConfigValue(key);
  const parsed = raw !== null ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
}

export async function fetchFreeMaxLevel(): Promise<number> {
  return fetchPositiveIntConfig('free_max_level', DEFAULT_FREE_MAX_LEVEL);
}

export async function fetchFreeDailyChatLimit(): Promise<number> {
  return fetchPositiveIntConfig('free_daily_chat_limit', DEFAULT_FREE_DAILY_CHAT_LIMIT);
}
