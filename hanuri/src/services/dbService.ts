import { supabase } from './supabase';
import { User, UserProgress } from '../types';

// Guest users (id starts with 'guest_') skip all Supabase calls
const isGuest = (userId: string) => userId.startsWith('guest_');

// ─── PROFILE ─────────────────────────────────────────────────

export async function syncProfile(user: User): Promise<void> {
  if (isGuest(user.id)) return;
  await supabase.from('profiles').upsert(
    {
      id: user.id,
      native_lang: user.native_lang,
      current_level: user.current_level,
      learning_goal: user.learning_goal,
      daily_goal_minutes: user.daily_goal_minutes,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );
}

export async function fetchProfile(userId: string): Promise<Partial<User> | null> {
  if (isGuest(userId)) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('native_lang, current_level, learning_goal, daily_goal_minutes')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return {
    native_lang: data.native_lang,
    current_level: data.current_level,
    learning_goal: data.learning_goal,
    daily_goal_minutes: data.daily_goal_minutes,
  };
}

// ─── USER STATS ───────────────────────────────────────────────

interface StatsPayload {
  xp: number;
  streak: number;
  lastStreakDate: string | null;
  todayMinutes: number;
}

export async function syncStats(userId: string, stats: StatsPayload): Promise<void> {
  if (isGuest(userId)) return;
  await supabase.from('user_stats').upsert(
    {
      user_id: userId,
      xp: stats.xp,
      streak: stats.streak,
      last_streak_date: stats.lastStreakDate,
      today_minutes: stats.todayMinutes,
      last_active_date: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );
}

export async function fetchStats(userId: string): Promise<StatsPayload | null> {
  if (isGuest(userId)) return null;
  const { data, error } = await supabase
    .from('user_stats')
    .select('xp, streak, last_streak_date, today_minutes')
    .eq('user_id', userId)
    .single();
  if (error || !data) return null;
  return {
    xp: data.xp ?? 0,
    streak: data.streak ?? 0,
    lastStreakDate: data.last_streak_date ?? null,
    todayMinutes: data.today_minutes ?? 0,
  };
}

// ─── LESSON PROGRESS ─────────────────────────────────────────

export async function syncProgress(userId: string, progress: UserProgress): Promise<void> {
  if (isGuest(userId)) return;
  await supabase.from('lesson_progress').upsert(
    {
      user_id: userId,
      lesson_id: progress.lesson_id,
      status: progress.status,
      score: progress.score,
      completed_at: progress.status === 'completed' ? new Date().toISOString() : null,
    },
    { onConflict: 'user_id,lesson_id' }
  );
}

export async function fetchAllProgress(userId: string): Promise<UserProgress[]> {
  if (isGuest(userId)) return [];
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('lesson_id, status, score, completed_at')
    .eq('user_id', userId);
  if (error || !data) return [];
  return data.map((row) => ({
    user_id: userId,
    lesson_id: row.lesson_id,
    status: row.status,
    score: row.score,
    completed_at: row.completed_at ?? undefined,
  }));
}

// ─── LOAD ALL (called on login) ───────────────────────────────

export interface RemoteUserData {
  profile: Partial<User> | null;
  stats: StatsPayload | null;
  progress: UserProgress[];
}

export async function loadUserDataFromSupabase(userId: string): Promise<RemoteUserData> {
  if (isGuest(userId)) return { profile: null, stats: null, progress: [] };
  const [profile, stats, progress] = await Promise.all([
    fetchProfile(userId),
    fetchStats(userId),
    fetchAllProgress(userId),
  ]);
  return { profile, stats, progress };
}
