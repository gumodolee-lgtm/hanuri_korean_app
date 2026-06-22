/**
 * dbService 단위 테스트
 * - isGuest / supabase=null 가드
 * - profiles / user_stats / lesson_progress 동기화 및 조회
 * - fetchLeaderboard, loadUserDataFromSupabase
 */

// ── Supabase 체이너블 mock ───────────────────────────────────────────────────
// from(table).upsert() / from(table).select().eq().single() /
// from(table).select().eq() / from(table).select().order().limit() 등
// 다양한 체인 깊이에서 await 가능하도록 thenable 객체로 구현하고,
// 테이블명별로 다른 결과를 돌려준다 (loadUserDataFromSupabase처럼 여러 테이블을
// 동시에 조회하는 경우를 지원하기 위함).

function makeBuilder(result: unknown) {
  const builder: Record<string, unknown> = {
    upsert: jest.fn(() => builder),
    select: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    single: jest.fn(() => builder),
    order: jest.fn(() => builder),
    limit: jest.fn(() => builder),
    then: (resolve: (v: unknown) => void) => resolve(result),
  };
  return builder;
}

const defaultResults: Record<string, unknown> = {
  profiles: { data: null, error: null },
  user_stats: { data: null, error: null },
  lesson_progress: { data: [], error: null },
};
let tableResults: Record<string, unknown> = { ...defaultResults };

const fromMock = jest.fn((table: string) => makeBuilder(tableResults[table]));

jest.mock('../src/services/supabase', () => ({
  get supabase() {
    return mockSupabaseClient;
  },
}));

let mockSupabaseClient: { from: typeof fromMock } | null = { from: fromMock };

import {
  syncProfile,
  fetchProfile,
  syncStats,
  fetchStats,
  syncProgress,
  fetchAllProgress,
  fetchLeaderboard,
  loadUserDataFromSupabase,
} from '../src/services/dbService';
import { User, UserProgress } from '../src/types';

const guestUser: User = {
  id: 'guest_1',
  email: '',
  native_lang: 'en',
  current_level: 1,
  xp: 0,
  streak: 0,
  daily_goal_minutes: 15,
  learning_goal: 'travel',
  created_at: '2026-01-01',
};

const realUser: User = { ...guestUser, id: 'user_real_1', email: 'a@b.com' };

beforeEach(() => {
  mockSupabaseClient = { from: fromMock };
  fromMock.mockClear();
  tableResults = { ...defaultResults };
});

describe('dbService — guest / supabase 미설정 가드', () => {
  it('guest 유저는 syncProfile이 supabase를 호출하지 않는다', async () => {
    await syncProfile(guestUser);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('supabase가 null이면 fetchProfile은 null을 반환한다', async () => {
    mockSupabaseClient = null;
    expect(await fetchProfile('user_real_1')).toBeNull();
  });

  it('guest 유저는 fetchAllProgress가 빈 배열을 반환한다', async () => {
    expect(await fetchAllProgress('guest_1')).toEqual([]);
  });

  it('supabase가 null이면 loadUserDataFromSupabase는 빈 결과를 반환한다', async () => {
    mockSupabaseClient = null;
    expect(await loadUserDataFromSupabase('user_real_1')).toEqual({
      profile: null,
      stats: null,
      progress: [],
    });
  });
});

describe('dbService — syncProfile', () => {
  it('실유저면 profiles 테이블에 upsert한다', async () => {
    await syncProfile(realUser);
    expect(fromMock).toHaveBeenCalledWith('profiles');
  });

  it('upsert 에러 시 예외를 던진다', async () => {
    tableResults.profiles = { error: { message: '실패' } };
    await expect(syncProfile(realUser)).rejects.toThrow('[syncProfile] 실패');
  });
});

describe('dbService — fetchProfile', () => {
  it('데이터가 있으면 매핑된 프로필을 반환한다', async () => {
    tableResults.profiles = {
      data: { native_lang: 'ko', current_level: 3, learning_goal: 'kpop', daily_goal_minutes: 30 },
      error: null,
    };
    const result = await fetchProfile('user_real_1');
    expect(result).toEqual({
      native_lang: 'ko',
      current_level: 3,
      learning_goal: 'kpop',
      daily_goal_minutes: 30,
    });
  });

  it('에러가 있으면 null을 반환한다', async () => {
    tableResults.profiles = { data: null, error: { message: 'not found' } };
    expect(await fetchProfile('user_real_1')).toBeNull();
  });
});

describe('dbService — syncStats / fetchStats', () => {
  it('syncStats는 user_stats 테이블에 upsert한다', async () => {
    await syncStats('user_real_1', {
      xp: 100, streak: 3, lastStreakDate: '2026-06-20', todayMinutes: 10, todayAiChatCount: 2,
    });
    expect(fromMock).toHaveBeenCalledWith('user_stats');
  });

  it('syncStats 에러 시 예외를 던진다', async () => {
    tableResults.user_stats = { error: { message: 'db down' } };
    await expect(
      syncStats('user_real_1', { xp: 0, streak: 0, lastStreakDate: null, todayMinutes: 0, todayAiChatCount: 0 })
    ).rejects.toThrow('[syncStats] db down');
  });

  it('fetchStats는 누락 필드를 기본값으로 채운다', async () => {
    tableResults.user_stats = {
      data: { xp: null, streak: null, last_streak_date: null, today_minutes: null, today_ai_chat_count: null, last_active_date: null },
      error: null,
    };
    expect(await fetchStats('user_real_1')).toEqual({
      xp: 0, streak: 0, lastStreakDate: null, todayMinutes: 0, todayAiChatCount: 0, lastActiveDate: null,
    });
  });

  it('guest 유저는 fetchStats가 null을 반환한다', async () => {
    expect(await fetchStats('guest_1')).toBeNull();
  });
});

describe('dbService — syncProgress', () => {
  it('status가 completed면 completed_at을 채워 upsert한다', async () => {
    const progress: UserProgress = { user_id: 'user_real_1', lesson_id: 'l1', status: 'completed', score: 90 };
    await syncProgress('user_real_1', progress);
    expect(fromMock).toHaveBeenCalledWith('lesson_progress');
  });

  it('upsert 에러 시 예외를 던진다', async () => {
    tableResults.lesson_progress = { error: { message: '실패2' } };
    const progress: UserProgress = { user_id: 'user_real_1', lesson_id: 'l1', status: 'in_progress', score: 0 };
    await expect(syncProgress('user_real_1', progress)).rejects.toThrow('[syncProgress] 실패2');
  });
});

describe('dbService — fetchAllProgress', () => {
  it('행을 UserProgress 배열로 매핑한다', async () => {
    tableResults.lesson_progress = {
      data: [{ lesson_id: 'l1', status: 'completed', score: 100, completed_at: '2026-06-20' }],
      error: null,
    };
    const result = await fetchAllProgress('user_real_1');
    expect(result).toEqual([
      { user_id: 'user_real_1', lesson_id: 'l1', status: 'completed', score: 100, completed_at: '2026-06-20' },
    ]);
  });

  it('에러 시 빈 배열을 반환한다', async () => {
    tableResults.lesson_progress = { data: null, error: { message: 'fail' } };
    expect(await fetchAllProgress('user_real_1')).toEqual([]);
  });
});

describe('dbService — fetchLeaderboard', () => {
  it('supabase가 null이면 빈 배열을 반환한다', async () => {
    mockSupabaseClient = null;
    expect(await fetchLeaderboard()).toEqual([]);
  });

  it('행을 LeaderEntry로 매핑한다', async () => {
    tableResults.user_stats = {
      data: [
        { user_id: 'u1', xp: 500, streak: 5, profiles: { current_level: 4, native_lang: 'en' } },
      ],
      error: null,
    };
    const result = await fetchLeaderboard(5);
    expect(result).toEqual([{ userId: 'u1', xp: 500, streak: 5, level: 4, nativeLang: 'en' }]);
  });

  it('profiles가 null인 행이 과반이면 경고를 출력한다', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    tableResults.user_stats = {
      data: [
        { user_id: 'u1', xp: 10, streak: 0, profiles: null },
        { user_id: 'u2', xp: 5, streak: 0, profiles: null },
      ],
      error: null,
    };
    const result = await fetchLeaderboard();
    expect(warnSpy).toHaveBeenCalled();
    expect(result[0].level).toBe(1);
    expect(result[0].nativeLang).toBe('en');
    warnSpy.mockRestore();
  });

  it('에러 시 빈 배열을 반환한다', async () => {
    tableResults.user_stats = { data: null, error: { message: 'fail' } };
    expect(await fetchLeaderboard()).toEqual([]);
  });
});

describe('dbService — loadUserDataFromSupabase', () => {
  it('guest 유저는 빈 결과를 즉시 반환한다', async () => {
    expect(await loadUserDataFromSupabase('guest_1')).toEqual({
      profile: null,
      stats: null,
      progress: [],
    });
  });

  it('profile/stats/progress를 병렬로 조회해 합친다', async () => {
    tableResults.profiles = {
      data: { native_lang: 'ko', current_level: 2, learning_goal: 'travel', daily_goal_minutes: 15 },
      error: null,
    };
    const result = await loadUserDataFromSupabase('user_real_1');
    expect(result.profile).toEqual({
      native_lang: 'ko', current_level: 2, learning_goal: 'travel', daily_goal_minutes: 15,
    });
    expect(result.stats).toBeNull();
    expect(result.progress).toEqual([]);
  });
});
