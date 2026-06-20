import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, Badge } from '../types';
import { syncStats, syncProgress, fetchStats, fetchAllProgress } from '../services/dbService';

const { persist, createJSONStorage } = require('zustand/middleware') as typeof import('zustand/middleware');

// Use local date (not UTC) to avoid timezone boundary bugs for streak calculation
const localDateString = (offsetDays = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

interface UserState {
  xp: number;
  streak: number;
  lastStreakDate: string | null;
  progress: UserProgress[];
  badges: Badge[];
  todayMinutes: number;
  todayLearned: boolean;
  aiChatCount: number;
  todayAiChatCount: number;
  aiChatCountDate: string | null;
  addXP: (amount: number, userId?: string) => void;
  markTodayLearned: (userId?: string) => void;
  incrementAIChatCount: (userId?: string) => void;
  resetStreak: () => void;
  updateProgress: (progress: UserProgress) => void;
  addTodayMinutes: (minutes: number, userId?: string) => void;
  resetTodayMinutes: () => void;
  checkNewDay: () => void;
  loadFromRemote: (userId: string) => Promise<void>;
  resetAll: () => void;
}

const INITIAL_STATE = {
  xp: 0,
  streak: 0,
  lastStreakDate: null,
  progress: [] as UserProgress[],
  badges: [] as Badge[],
  todayMinutes: 0,
  todayLearned: false,
  aiChatCount: 0,
  todayAiChatCount: 0,
  aiChatCountDate: null as string | null,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      addXP: (amount, userId) => {
        const newXp = get().xp + amount;
        set({ xp: newXp });
        if (userId) {
          const { streak, lastStreakDate, todayMinutes, todayAiChatCount } = get();
          syncStats(userId, { xp: newXp, streak, lastStreakDate, todayMinutes, todayAiChatCount }).catch(() => {});
        }
      },

      // 실제 학습 행위(레슨 완료, AI 채팅 등) 후 호출
      // 날짜 경계 리셋(todayMinutes, streak)은 checkNewDay가 담당하므로
      // 이 함수는 streak 갱신과 todayLearned 마킹만 수행
      markTodayLearned: (userId) => {
        const today = localDateString();
        const { lastStreakDate, streak, xp, todayMinutes, todayAiChatCount } = get();

        // 이미 오늘 streak이 갱신되었으면 스킵
        if (lastStreakDate === today) return;

        const yesterday = localDateString(-1);
        const newStreak = lastStreakDate === yesterday ? streak + 1 : 1;

        set({ todayLearned: true, streak: newStreak, lastStreakDate: today });
        if (userId) {
          syncStats(userId, { xp, streak: newStreak, lastStreakDate: today, todayMinutes, todayAiChatCount }).catch(() => {});
        }
      },

      // aiChatCount: 배지(ai_chat_5)용 평생 누적 카운트 — 절대 리셋하지 않음
      // todayAiChatCount: 무료 티어 일일 한도(3회/일) 게이팅용 — checkNewDay에서 매일 리셋되고
      // 서버(user_stats.today_ai_chat_count)에 동기화되어 재설치로 우회할 수 없음
      incrementAIChatCount: (userId) => {
        const newTodayCount = get().todayAiChatCount + 1;
        set((state) => ({ aiChatCount: state.aiChatCount + 1, todayAiChatCount: newTodayCount }));
        if (userId) {
          const { xp, streak, lastStreakDate, todayMinutes } = get();
          syncStats(userId, { xp, streak, lastStreakDate, todayMinutes, todayAiChatCount: newTodayCount }).catch(() => {});
        }
      },

      resetStreak: () => set({ streak: 0, lastStreakDate: null }),

      updateProgress: (newProgress) => {
        set((state) => ({
          progress: [
            ...state.progress.filter((p) => p.lesson_id !== newProgress.lesson_id),
            newProgress,
          ],
        }));
        // Sync to Supabase (skip for guest)
        if (!newProgress.user_id.startsWith('guest_')) {
          syncProgress(newProgress.user_id, newProgress).catch(() => {});
        }
      },

      addTodayMinutes: (minutes, userId) => {
        const newMinutes = get().todayMinutes + minutes;
        set({ todayMinutes: newMinutes });
        if (userId) {
          const { xp, streak, lastStreakDate, todayAiChatCount } = get();
          syncStats(userId, { xp, streak, lastStreakDate, todayMinutes: newMinutes, todayAiChatCount }).catch(() => {});
        }
      },

      resetTodayMinutes: () => set({ todayMinutes: 0 }),

      // 앱 실행 시 날짜가 바뀌었으면 당일 학습 상태 초기화 (RootNavigator 마운트 시 호출)
      // - 하루 지난 경우: todayMinutes, todayLearned 초기화
      // - 이틀 이상 건너뛴 경우: streak도 0으로 초기화 (연속 학습 끊김)
      checkNewDay: () => {
        const today = localDateString();
        const yesterday = localDateString(-1);
        const { lastStreakDate, aiChatCountDate } = get();

        // 무료 채팅 일일 한도는 streak과 별개의 날짜 경계로 리셋 (streak는 끊김 허용, 채팅 한도는 매일 0으로)
        if (aiChatCountDate !== today) {
          set({ todayAiChatCount: 0, aiChatCountDate: today });
        }

        if (lastStreakDate === today) return;
        const streakBroken = lastStreakDate !== null && lastStreakDate !== yesterday;
        set({
          todayMinutes: 0,
          todayLearned: false,
          ...(streakBroken && { streak: 0 }),
        });
      },

      // Called after Supabase login to hydrate store from server
      loadFromRemote: async (userId: string) => {
        const [stats, progress] = await Promise.all([
          fetchStats(userId),
          fetchAllProgress(userId),
        ]);
        if (stats) {
          const today = localDateString();
          // 서버의 일일 채팅 카운트는 last_active_date가 오늘인 경우에만 신뢰 (지난 날짜면 0으로 취급)
          const remoteCountIsToday = stats.lastActiveDate === today;
          set({
            xp: stats.xp,
            streak: stats.streak,
            lastStreakDate: stats.lastStreakDate,
            todayMinutes: stats.todayMinutes,
            // Restore todayLearned if user already studied today on another device
            todayLearned: stats.lastStreakDate === today,
            todayAiChatCount: remoteCountIsToday ? stats.todayAiChatCount : 0,
            aiChatCountDate: remoteCountIsToday ? today : null,
          });
        }
        if (progress.length > 0) {
          set({ progress });
        }
      },

      // 로그아웃/계정 전환 시 모든 데이터 초기화
      resetAll: () => set({ ...INITIAL_STATE }),
    }),
    {
      name: 'hanuri-user',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        xp: state.xp,
        streak: state.streak,
        lastStreakDate: state.lastStreakDate,
        progress: state.progress,
        badges: state.badges,
        todayMinutes: state.todayMinutes,
        todayLearned: state.todayLearned,
        aiChatCount: state.aiChatCount,
        todayAiChatCount: state.todayAiChatCount,
        aiChatCountDate: state.aiChatCountDate,
      }),
    }
  )
);
