import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, Badge } from '../types';
import { syncStats, syncProgress, fetchStats, fetchAllProgress } from '../services/dbService';

interface UserState {
  xp: number;
  streak: number;
  lastStreakDate: string | null;
  progress: UserProgress[];
  badges: Badge[];
  todayMinutes: number;
  todayLearned: boolean;
  aiChatCount: number;
  addXP: (amount: number, userId?: string) => void;
  checkAndUpdateStreak: (userId?: string) => void;
  markTodayLearned: (userId?: string) => void;
  incrementAIChatCount: () => void;
  resetStreak: () => void;
  updateProgress: (progress: UserProgress) => void;
  unlockBadge: (badgeId: string) => void;
  addTodayMinutes: (minutes: number, userId?: string) => void;
  resetTodayMinutes: () => void;
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
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      addXP: (amount, userId) => {
        const newXp = get().xp + amount;
        set({ xp: newXp });
        if (userId) {
          const { streak, lastStreakDate, todayMinutes } = get();
          syncStats(userId, { xp: newXp, streak, lastStreakDate, todayMinutes });
        }
      },

      // streak는 markTodayLearned()가 호출된 날에만 갱신됨
      // 화면 마운트가 아닌 실제 학습(레슨 완료, AI 채팅 등) 후 호출할 것
      checkAndUpdateStreak: (userId) => {
        const today = new Date().toISOString().split('T')[0];
        const { lastStreakDate, streak, xp, todayLearned } = get();

        // 오늘 학습한 적 없으면 streak 갱신하지 않음
        if (!todayLearned) return;
        if (lastStreakDate === today) return;

        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const newStreak = lastStreakDate === yesterday ? streak + 1 : 1;

        // 날짜가 바뀌었으므로 오늘 학습시간 리셋
        set({ streak: newStreak, lastStreakDate: today, todayMinutes: 0 });
        if (userId) {
          syncStats(userId, { xp, streak: newStreak, lastStreakDate: today, todayMinutes: 0 });
        }
      },

      // 실제 학습 행위(레슨 완료, AI 채팅 등) 후 호출
      markTodayLearned: (userId) => {
        const today = new Date().toISOString().split('T')[0];
        const { lastStreakDate } = get();

        // 이미 오늘 학습 기록이 있으면 스킵
        if (lastStreakDate === today) return;

        set({ todayLearned: true });

        // markTodayLearned 후 바로 streak 갱신
        const { streak, xp } = get();
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const newStreak = lastStreakDate === yesterday ? streak + 1 : 1;

        set({ streak: newStreak, lastStreakDate: today, todayMinutes: 0 });
        if (userId) {
          syncStats(userId, { xp, streak: newStreak, lastStreakDate: today, todayMinutes: 0 });
        }
      },

      incrementAIChatCount: () => {
        set((state) => ({ aiChatCount: state.aiChatCount + 1 }));
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
          syncProgress(newProgress.user_id, newProgress);
        }
      },

      unlockBadge: (badgeId) =>
        set((state) => ({
          badges: state.badges.map((b) =>
            b.id === badgeId ? { ...b, unlocked: true } : b
          ),
        })),

      addTodayMinutes: (minutes, userId) => {
        const newMinutes = get().todayMinutes + minutes;
        set({ todayMinutes: newMinutes });
        if (userId) {
          const { xp, streak, lastStreakDate } = get();
          syncStats(userId, { xp, streak, lastStreakDate, todayMinutes: newMinutes });
        }
      },

      resetTodayMinutes: () => set({ todayMinutes: 0 }),

      // Called after Supabase login to hydrate store from server
      loadFromRemote: async (userId: string) => {
        const [stats, progress] = await Promise.all([
          fetchStats(userId),
          fetchAllProgress(userId),
        ]);
        if (stats) {
          set({
            xp: stats.xp,
            streak: stats.streak,
            lastStreakDate: stats.lastStreakDate,
            todayMinutes: stats.todayMinutes,
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
      }),
    }
  )
);
