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
  addXP: (amount: number, userId?: string) => void;
  checkAndUpdateStreak: (userId?: string) => void;
  resetStreak: () => void;
  updateProgress: (progress: UserProgress) => void;
  unlockBadge: (badgeId: string) => void;
  addTodayMinutes: (minutes: number, userId?: string) => void;
  resetTodayMinutes: () => void;
  loadFromRemote: (userId: string) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      xp: 0,
      streak: 0,
      lastStreakDate: null,
      progress: [],
      badges: [],
      todayMinutes: 0,

      addXP: (amount, userId) => {
        set((state) => ({ xp: state.xp + amount }));
        if (userId) {
          const { xp, streak, lastStreakDate, todayMinutes } = get();
          syncStats(userId, { xp: xp + amount, streak, lastStreakDate, todayMinutes });
        }
      },

      checkAndUpdateStreak: (userId) => {
        const today = new Date().toISOString().split('T')[0];
        const { lastStreakDate, streak, xp, todayMinutes } = get();

        if (lastStreakDate === today) return;

        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const newStreak = lastStreakDate === yesterday ? streak + 1 : 1;

        set({ streak: newStreak, lastStreakDate: today });
        if (userId) {
          syncStats(userId, { xp, streak: newStreak, lastStreakDate: today, todayMinutes });
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
        set((state) => ({ todayMinutes: state.todayMinutes + minutes }));
        if (userId) {
          const { xp, streak, lastStreakDate, todayMinutes } = get();
          syncStats(userId, { xp, streak, lastStreakDate, todayMinutes: todayMinutes + minutes });
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
      }),
    }
  )
);
