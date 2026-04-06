import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, NativeLanguage, LearningGoal, DailyGoalMinutes } from '../types';
import { syncProfile, loadUserDataFromSupabase } from '../services/dbService';
import { useUserStore } from './userStore';

interface OnboardingData {
  nativeLanguage: NativeLanguage;
  learningGoal: LearningGoal;
  dailyGoalMinutes: DailyGoalMinutes;
  currentLevel: number;
}

interface AuthState {
  user: User | null;
  hasCompletedOnboarding: boolean;
  onboardingData: Partial<OnboardingData>;
  setUser: (user: User | null) => void;
  setOnboardingData: (data: Partial<OnboardingData>) => void;
  completeOnboarding: () => void;
  loginWithSupabase: (user: User) => Promise<void>;
  updateProfile: (partial: Partial<Pick<User, 'native_lang' | 'daily_goal_minutes' | 'learning_goal'>>) => void;
  upgradeToPro: () => void;
  levelUp: () => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      hasCompletedOnboarding: false,
      onboardingData: {},

      setUser: (user) => set({ user }),

      setOnboardingData: (data) =>
        set((state) => ({
          onboardingData: { ...state.onboardingData, ...data },
        })),

      completeOnboarding: () => {
        const state = get();
        const newUser: User = {
          id: 'guest_' + Date.now(),
          email: '',
          native_lang: (state.onboardingData.nativeLanguage ?? 'en') as NativeLanguage,
          current_level: (state.onboardingData.currentLevel ?? 1),
          xp: 0,
          streak: 0,
          daily_goal_minutes: (state.onboardingData.dailyGoalMinutes ?? 15) as DailyGoalMinutes,
          learning_goal: (state.onboardingData.learningGoal ?? 'travel') as LearningGoal,
          created_at: new Date().toISOString(),
        };
        set({ hasCompletedOnboarding: true, user: newUser });
        // Guest: no Supabase sync needed
      },

      // Called after Google/Apple login — fetches server data and merges
      loginWithSupabase: async (supaUser: User) => {
        set({ user: supaUser, hasCompletedOnboarding: true });
        // Sync profile to DB first — failure is non-fatal (local state already set)
        try {
          await syncProfile(supaUser);
        } catch (err) {
          console.warn('[authStore] syncProfile failed — continuing with local state:', err);
        }
        // Then fetch any existing server data (XP, streak, progress)
        try {
          const remote = await loadUserDataFromSupabase(supaUser.id);
          if (remote.profile) {
            set((state) => ({
              user: state.user
                ? {
                    ...state.user,
                    native_lang: remote.profile!.native_lang ?? state.user.native_lang,
                    current_level: remote.profile!.current_level ?? state.user.current_level,
                    learning_goal: remote.profile!.learning_goal ?? state.user.learning_goal,
                    daily_goal_minutes: remote.profile!.daily_goal_minutes ?? state.user.daily_goal_minutes,
                  }
                : state.user,
            }));
          }
        } catch (err) {
          console.warn('[authStore] loadUserDataFromSupabase failed — local state preserved:', err instanceof Error ? err.message : String(err));
        }
        // Remote stats + progress are applied by userStore.loadFromRemote()
        // (called separately to avoid circular imports)
        return;
      },

      // Updates editable profile fields locally + syncs to Supabase (fire-and-forget)
      updateProfile: (partial) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : state.user,
        }));
        const updated = get().user;
        if (updated) {
          syncProfile(updated).catch(() => {});
        }
      },

      // Activates PRO (call after payment is verified)
      upgradeToPro: () =>
        set((state) => ({
          user: state.user ? { ...state.user, isPro: true } : state.user,
        })),

      // Advances the user to the next level
      levelUp: () =>
        set((state) => ({
          user: state.user
            ? { ...state.user, current_level: state.user.current_level + 1 }
            : state.user,
        })),

      signOut: () => {
        // 모든 persist store 초기화 (계정 간 데이터 혼재 방지)
        useUserStore.getState().resetAll();
        set({
          user: null,
          hasCompletedOnboarding: false,
          onboardingData: {},
        });
      },

    }),
    {
      name: 'hanuri-auth',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist these fields — not functions
      partialize: (state) => ({
        user: state.user,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        onboardingData: state.onboardingData,
      }),
    }
  )
);
