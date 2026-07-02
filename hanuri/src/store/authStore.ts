import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, NativeLanguage, LearningGoal, DailyGoalMinutes } from '../types';
import { syncProfile, loadUserDataFromSupabase } from '../services/dbService';
import { loginUser, logoutUser, getCustomerInfo, isPro as checkIsPro } from '../services/revenuecatService';
import { useUserStore } from './userStore';

const { persist, createJSONStorage } = require('zustand/middleware') as typeof import('zustand/middleware');

interface OnboardingData {
  nativeLanguage: NativeLanguage;
  learningGoal: LearningGoal;
  dailyGoalMinutes: DailyGoalMinutes;
  currentLevel: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';

interface AuthState {
  user: User | null;
  hasCompletedOnboarding: boolean;
  onboardingData: Partial<OnboardingData>;
  themeMode: ThemeMode;
  reminderHour: number; // 일일 학습 알림 시각 (0-23) — 온보딩/프로필에서 설정, 기기 설정이라 signOut에도 유지
  setUser: (user: User | null) => void;
  setOnboardingData: (data: Partial<OnboardingData>) => void;
  completeOnboarding: () => void;
  loginWithSupabase: (user: User) => Promise<void>;
  updateProfile: (partial: Partial<Pick<User, 'native_lang' | 'daily_goal_minutes' | 'learning_goal'>>) => void;
  upgradeToPro: () => void;
  syncProStatus: () => Promise<void>;
  levelUp: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  setReminderHour: (hour: number) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      hasCompletedOnboarding: false,
      onboardingData: {},
      themeMode: 'system' as ThemeMode,
      reminderHour: 20,

      setUser: (user) => set({ user }),

      setThemeMode: (mode) => set({ themeMode: mode }),

      setReminderHour: (hour) => set({ reminderHour: hour }),

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
        // Link RevenueCat user identity to Supabase user id for purchase restoration
        loginUser(supaUser.id).catch(() => {});
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

      // Syncs Pro status from RevenueCat — call on app start and after login
      // entitlement 비활성(구독 만료/환불) 시 isPro를 false로 내려 영구 Pro 잔류를 방지
      syncProStatus: async () => {
        const { user } = get();
        if (!user || user.id.startsWith('guest_')) return;
        try {
          const customerInfo = await getCustomerInfo();
          const active = checkIsPro(customerInfo);
          set((state) => ({
            user: state.user ? { ...state.user, isPro: active } : state.user,
          }));
        } catch {
          // Non-fatal: preserve existing isPro state
        }
      },

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
        logoutUser().catch(() => {});
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
        themeMode: state.themeMode,
        reminderHour: state.reminderHour,
      }),
    }
  )
);
