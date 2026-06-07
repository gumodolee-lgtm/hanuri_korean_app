/**
 * userStore 단위 테스트
 * - 순수 비즈니스 로직 (addXP, streak, checkNewDay 등)
 * - AsyncStorage / Supabase는 mock 처리
 */

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../src/services/dbService', () => ({
  syncStats: jest.fn().mockResolvedValue(undefined),
  syncProgress: jest.fn().mockResolvedValue(undefined),
  fetchStats: jest.fn().mockResolvedValue(null),
  fetchAllProgress: jest.fn().mockResolvedValue([]),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

function localDateString(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const TODAY = localDateString(0);
const YESTERDAY = localDateString(-1);
const TWO_DAYS_AGO = localDateString(-2);

// ── Store Factory ──────────────────────────────────────────────────────────

// Zustand store를 리셋하기 위해 각 테스트에서 새 인스턴스 대신
// 상태를 직접 조작하는 방식으로 테스트
import { useUserStore } from '../src/store/userStore';

beforeEach(() => {
  useUserStore.getState().resetAll();
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe('userStore — addXP', () => {
  it('XP가 증가한다', () => {
    useUserStore.getState().addXP(10);
    expect(useUserStore.getState().xp).toBe(10);
  });

  it('XP가 누적된다', () => {
    useUserStore.getState().addXP(10);
    useUserStore.getState().addXP(5);
    expect(useUserStore.getState().xp).toBe(15);
  });

  it('userId가 있으면 syncStats를 호출한다', () => {
    const { syncStats } = require('../src/services/dbService');
    useUserStore.getState().addXP(10, 'user_123');
    expect(syncStats).toHaveBeenCalledWith('user_123', expect.objectContaining({ xp: 10 }));
  });

  it('userId 없이도 정상 동작한다 (게스트 모드)', () => {
    const { syncStats } = require('../src/services/dbService');
    useUserStore.getState().addXP(5);
    expect(syncStats).not.toHaveBeenCalled();
    expect(useUserStore.getState().xp).toBe(5);
  });
});

describe('userStore — markTodayLearned (streak)', () => {
  it('처음 학습 시 streak = 1이 된다', () => {
    useUserStore.getState().markTodayLearned();
    const s = useUserStore.getState();
    expect(s.streak).toBe(1);
    expect(s.todayLearned).toBe(true);
    expect(s.lastStreakDate).toBe(TODAY);
  });

  it('어제 학습했으면 streak이 +1 증가한다', () => {
    // 어제 상태 시뮬레이션
    useUserStore.setState({ streak: 3, lastStreakDate: YESTERDAY });
    useUserStore.getState().markTodayLearned();
    expect(useUserStore.getState().streak).toBe(4);
  });

  it('이틀 이상 건너뛰면 streak이 1로 리셋된다', () => {
    useUserStore.setState({ streak: 5, lastStreakDate: TWO_DAYS_AGO });
    useUserStore.getState().markTodayLearned();
    expect(useUserStore.getState().streak).toBe(1);
  });

  it('오늘 이미 학습했으면 중복 호출해도 streak이 변하지 않는다', () => {
    useUserStore.getState().markTodayLearned();
    const streakAfterFirst = useUserStore.getState().streak;
    useUserStore.getState().markTodayLearned();
    expect(useUserStore.getState().streak).toBe(streakAfterFirst);
  });
});

describe('userStore — checkNewDay', () => {
  it('오늘이면 아무 변경 없다', () => {
    useUserStore.setState({
      streak: 5,
      lastStreakDate: TODAY,
      todayMinutes: 30,
      todayLearned: true,
    });
    useUserStore.getState().checkNewDay();
    const s = useUserStore.getState();
    expect(s.streak).toBe(5);
    expect(s.todayMinutes).toBe(30);
    expect(s.todayLearned).toBe(true);
  });

  it('어제 마지막 학습 → todayMinutes/todayLearned 리셋, streak 유지', () => {
    useUserStore.setState({
      streak: 5,
      lastStreakDate: YESTERDAY,
      todayMinutes: 20,
      todayLearned: true,
    });
    useUserStore.getState().checkNewDay();
    const s = useUserStore.getState();
    expect(s.todayMinutes).toBe(0);
    expect(s.todayLearned).toBe(false);
    expect(s.streak).toBe(5); // streak는 건드리지 않음
  });

  it('이틀 이상 건너뜀 → streak도 0으로 리셋', () => {
    useUserStore.setState({
      streak: 10,
      lastStreakDate: TWO_DAYS_AGO,
      todayMinutes: 0,
      todayLearned: false,
    });
    useUserStore.getState().checkNewDay();
    const s = useUserStore.getState();
    expect(s.streak).toBe(0);
  });

  it('lastStreakDate가 null이면 streak 리셋하지 않음 (첫 사용자)', () => {
    useUserStore.setState({ streak: 0, lastStreakDate: null });
    useUserStore.getState().checkNewDay();
    expect(useUserStore.getState().streak).toBe(0);
  });
});

describe('userStore — incrementAIChatCount', () => {
  it('aiChatCount가 1씩 증가한다', () => {
    expect(useUserStore.getState().aiChatCount).toBe(0);
    useUserStore.getState().incrementAIChatCount();
    expect(useUserStore.getState().aiChatCount).toBe(1);
    useUserStore.getState().incrementAIChatCount();
    expect(useUserStore.getState().aiChatCount).toBe(2);
  });
});

describe('userStore — updateProgress', () => {
  it('새 진도를 추가한다', () => {
    const prog = {
      user_id: 'guest_001',
      lesson_id: 'l1u1l1',
      status: 'completed' as const,
      score: 90,
    };
    useUserStore.getState().updateProgress(prog);
    const state = useUserStore.getState();
    expect(state.progress).toHaveLength(1);
    expect(state.progress[0]).toEqual(prog);
  });

  it('같은 lesson_id 진도는 교체(upsert)된다', () => {
    const prog1 = { user_id: 'guest_001', lesson_id: 'l1u1l1', status: 'in_progress' as const, score: 50 };
    const prog2 = { user_id: 'guest_001', lesson_id: 'l1u1l1', status: 'completed' as const, score: 95 };
    useUserStore.getState().updateProgress(prog1);
    useUserStore.getState().updateProgress(prog2);
    const state = useUserStore.getState();
    expect(state.progress).toHaveLength(1);
    expect(state.progress[0].status).toBe('completed');
    expect(state.progress[0].score).toBe(95);
  });

  it('게스트 유저는 syncProgress를 호출하지 않는다', () => {
    const { syncProgress } = require('../src/services/dbService');
    useUserStore.getState().updateProgress({
      user_id: 'guest_abc',
      lesson_id: 'l1u1l1',
      status: 'completed',
      score: 80,
    });
    expect(syncProgress).not.toHaveBeenCalled();
  });

  it('실제 유저는 syncProgress를 호출한다', () => {
    const { syncProgress } = require('../src/services/dbService');
    useUserStore.getState().updateProgress({
      user_id: 'user_real_123',
      lesson_id: 'l1u1l1',
      status: 'completed',
      score: 85,
    });
    expect(syncProgress).toHaveBeenCalledWith('user_real_123', expect.any(Object));
  });
});

describe('userStore — addTodayMinutes', () => {
  it('오늘 학습 시간이 누적된다', () => {
    useUserStore.getState().addTodayMinutes(10);
    useUserStore.getState().addTodayMinutes(5);
    expect(useUserStore.getState().todayMinutes).toBe(15);
  });
});

describe('userStore — resetAll', () => {
  it('모든 상태를 초기값으로 복원한다', () => {
    useUserStore.setState({ xp: 999, streak: 7, aiChatCount: 10 });
    useUserStore.getState().resetAll();
    const s = useUserStore.getState();
    expect(s.xp).toBe(0);
    expect(s.streak).toBe(0);
    expect(s.aiChatCount).toBe(0);
    expect(s.progress).toEqual([]);
    expect(s.badges).toEqual([]);
  });
});

describe('userStore — resetStreak', () => {
  it('streak과 lastStreakDate를 초기화한다', () => {
    useUserStore.setState({ streak: 5, lastStreakDate: TODAY });
    useUserStore.getState().resetStreak();
    const s = useUserStore.getState();
    expect(s.streak).toBe(0);
    expect(s.lastStreakDate).toBeNull();
  });
});
