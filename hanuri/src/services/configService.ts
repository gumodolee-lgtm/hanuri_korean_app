import { supabase } from './supabase';
import { FREE_MAX_LEVEL as DEFAULT_FREE_MAX_LEVEL } from '../data/lessons';

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

export async function fetchFreeMaxLevel(): Promise<number> {
  const raw = await fetchConfigValue('free_max_level');
  const parsed = raw !== null ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_FREE_MAX_LEVEL;
}
