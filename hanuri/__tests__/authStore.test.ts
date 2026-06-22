/**
 * authStore 단위 테스트
 * - completeOnboarding (guest user 생성)
 * - updateProfile (로컬 + 서버 동기화)
 * - upgradeToPro, levelUp
 * - signOut (모든 store 초기화)
 * - themeMode
 */

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../src/services/dbService', () => ({
  syncProfile: jest.fn().mockResolvedValue(undefined),
  loadUserDataFromSupabase: jest.fn().mockResolvedValue({
    profile: null,
    stats: null,
    progress: [],
  }),
}));

jest.mock('../src/services/revenuecatService', () => ({
  loginUser: jest.fn().mockResolvedValue(undefined),
  logoutUser: jest.fn().mockResolvedValue(undefined),
  getCustomerInfo: jest.fn().mockResolvedValue({ entitlements: { active: {} } }),
  isPro: jest.fn().mockReturnValue(false),
}));

jest.mock('../src/store/userStore', () => ({
  useUserStore: {
    getState: jest.fn().mockReturnValue({ resetAll: jest.fn() }),
  },
}));

// ── Store ──────────────────────────────────────────────────────────────────

import { useAuthStore } from '../src/store/authStore';

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    hasCompletedOnboarding: false,
    onboardingData: {},
    themeMode: 'system',
  });
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe('authStore — setOnboardingData', () => {
  it('온보딩 데이터를 병합 저장한다', () => {
    useAuthStore.getState().setOnboardingData({ nativeLanguage: 'ko' });
    useAuthStore.getState().setOnboardingData({ learningGoal: 'kpop' });
    const { onboardingData } = useAuthStore.getState();
    expect(onboardingData.nativeLanguage).toBe('ko');
    expect(onboardingData.learningGoal).toBe('kpop');
  });
});

describe('authStore — completeOnboarding', () => {
  it('게스트 유저가 생성되고 hasCompletedOnboarding이 true가 된다', () => {
    useAuthStore.getState().setOnboardingData({
      nativeLanguage: 'en',
      learningGoal: 'travel',
      dailyGoalMinutes: 15,
      currentLevel: 1,
    });
    useAuthStore.getState().completeOnboarding();

    const { user, hasCompletedOnboarding } = useAuthStore.getState();
    expect(hasCompletedOnboarding).toBe(true);
    expect(user).not.toBeNull();
    expect(user!.id).toMatch(/^guest_/);
    expect(user!.native_lang).toBe('en');
    expect(user!.learning_goal).toBe('travel');
    expect(user!.daily_goal_minutes).toBe(15);
    expect(user!.current_level).toBe(1);
    expect(user!.xp).toBe(0);
    expect(user!.streak).toBe(0);
  });

  it('온보딩 데이터 없으면 기본값으로 유저 생성', () => {
    useAuthStore.getState().completeOnboarding();
    const { user } = useAuthStore.getState();
    expect(user).not.toBeNull();
    expect(user!.native_lang).toBe('en');
    expect(user!.daily_goal_minutes).toBe(15);
    expect(user!.learning_goal).toBe('travel');
    expect(user!.current_level).toBe(1);
  });
});

describe('authStore — upgradeToPro', () => {
  it('isPro가 true가 된다', () => {
    useAuthStore.setState({
      user: {
        id: 'guest_1',
        email: '',
        native_lang: 'en',
        current_level: 1,
        xp: 0,
        streak: 0,
        daily_goal_minutes: 15,
        learning_goal: 'travel',
        created_at: '2026-01-01',
        isPro: false,
      },
    });
    useAuthStore.getState().upgradeToPro();
    expect(useAuthStore.getState().user?.isPro).toBe(true);
  });

  it('user가 null이면 아무 변화 없다', () => {
    useAuthStore.setState({ user: null });
    useAuthStore.getState().upgradeToPro();
    expect(useAuthStore.getState().user).toBeNull();
  });
});

describe('authStore — levelUp', () => {
  it('current_level이 1 증가한다', () => {
    useAuthStore.setState({
      user: {
        id: 'guest_1',
        email: '',
        native_lang: 'en',
        current_level: 3,
        xp: 0,
        streak: 0,
        daily_goal_minutes: 15,
        learning_goal: 'travel',
        created_at: '2026-01-01',
      },
    });
    useAuthStore.getState().levelUp();
    expect(useAuthStore.getState().user?.current_level).toBe(4);
  });
});

describe('authStore — updateProfile', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: 'user_real',
        email: 'test@test.com',
        native_lang: 'en',
        current_level: 1,
        xp: 0,
        streak: 0,
        daily_goal_minutes: 15,
        learning_goal: 'travel',
        created_at: '2026-01-01',
      },
    });
  });

  it('native_lang을 업데이트한다', () => {
    useAuthStore.getState().updateProfile({ native_lang: 'ko' });
    expect(useAuthStore.getState().user?.native_lang).toBe('ko');
  });

  it('daily_goal_minutes를 업데이트한다', () => {
    useAuthStore.getState().updateProfile({ daily_goal_minutes: 30 });
    expect(useAuthStore.getState().user?.daily_goal_minutes).toBe(30);
  });

  it('syncProfile을 호출한다', () => {
    const { syncProfile } = require('../src/services/dbService');
    useAuthStore.getState().updateProfile({ native_lang: 'ko' });
    expect(syncProfile).toHaveBeenCalled();
  });
});

describe('authStore — signOut', () => {
  it('user를 null로 초기화하고 hasCompletedOnboarding을 false로 설정한다', () => {
    useAuthStore.setState({
      user: { id: 'user_1', email: 'test@test.com', native_lang: 'en', current_level: 1, xp: 0, streak: 0, daily_goal_minutes: 15, learning_goal: 'travel', created_at: '2026-01-01' },
      hasCompletedOnboarding: true,
    });
    useAuthStore.getState().signOut();
    const s = useAuthStore.getState();
    expect(s.user).toBeNull();
    expect(s.hasCompletedOnboarding).toBe(false);
    expect(s.onboardingData).toEqual({});
  });

  it('userStore.resetAll을 호출한다', () => {
    const { useUserStore } = require('../src/store/userStore');
    const resetAll = useUserStore.getState().resetAll;
    resetAll.mockClear();
    useAuthStore.getState().signOut();
    expect(resetAll).toHaveBeenCalled();
  });
});

describe('authStore — themeMode', () => {
  it('테마 모드를 변경한다', () => {
    useAuthStore.getState().setThemeMode('dark');
    expect(useAuthStore.getState().themeMode).toBe('dark');
  });

  it('light 모드로 변경한다', () => {
    useAuthStore.getState().setThemeMode('light');
    expect(useAuthStore.getState().themeMode).toBe('light');
  });
});

describe('authStore — loginWithSupabase', () => {
  const supaUser = {
    id: 'user_supa_1',
    email: 'supa@test.com',
    native_lang: 'en' as const,
    current_level: 1,
    xp: 0,
    streak: 0,
    daily_goal_minutes: 15 as const,
    learning_goal: 'travel' as const,
    created_at: '2026-01-01',
  };

  it('user를 설정하고 hasCompletedOnboarding을 true로 만든다', async () => {
    await useAuthStore.getState().loginWithSupabase(supaUser);
    const { user, hasCompletedOnboarding } = useAuthStore.getState();
    expect(user?.id).toBe('user_supa_1');
    expect(hasCompletedOnboarding).toBe(true);
  });

  it('서버에 원격 프로필이 있으면 로컬 user에 병합한다', async () => {
    const { loadUserDataFromSupabase } = require('../src/services/dbService');
    loadUserDataFromSupabase.mockResolvedValueOnce({
      profile: { native_lang: 'ko', current_level: 5, learning_goal: 'kpop', daily_goal_minutes: 30 },
      stats: null,
      progress: [],
    });
    await useAuthStore.getState().loginWithSupabase(supaUser);
    const { user } = useAuthStore.getState();
    expect(user?.native_lang).toBe('ko');
    expect(user?.current_level).toBe(5);
  });

  it('syncProfile이 실패해도 로컬 상태는 유지된다', async () => {
    const { syncProfile } = require('../src/services/dbService');
    syncProfile.mockRejectedValueOnce(new Error('network error'));
    await useAuthStore.getState().loginWithSupabase(supaUser);
    expect(useAuthStore.getState().user?.id).toBe('user_supa_1');
  });

  it('loadUserDataFromSupabase가 실패해도 로컬 상태는 유지된다', async () => {
    const { loadUserDataFromSupabase } = require('../src/services/dbService');
    loadUserDataFromSupabase.mockRejectedValueOnce(new Error('network error'));
    await useAuthStore.getState().loginWithSupabase(supaUser);
    expect(useAuthStore.getState().user?.id).toBe('user_supa_1');
  });

  it('RevenueCat에 유저를 연결한다', async () => {
    const { loginUser } = require('../src/services/revenuecatService');
    await useAuthStore.getState().loginWithSupabase(supaUser);
    expect(loginUser).toHaveBeenCalledWith('user_supa_1');
  });
});

describe('authStore — syncProStatus', () => {
  it('user가 없으면 아무것도 하지 않는다', async () => {
    useAuthStore.setState({ user: null });
    const { getCustomerInfo } = require('../src/services/revenuecatService');
    await useAuthStore.getState().syncProStatus();
    expect(getCustomerInfo).not.toHaveBeenCalled();
  });

  it('guest 유저면 아무것도 하지 않는다', async () => {
    useAuthStore.setState({
      user: { id: 'guest_1', email: '', native_lang: 'en', current_level: 1, xp: 0, streak: 0, daily_goal_minutes: 15, learning_goal: 'travel', created_at: '2026-01-01' },
    });
    const { getCustomerInfo } = require('../src/services/revenuecatService');
    await useAuthStore.getState().syncProStatus();
    expect(getCustomerInfo).not.toHaveBeenCalled();
  });

  it('실유저이고 isPro가 true면 user.isPro를 true로 설정한다', async () => {
    useAuthStore.setState({
      user: { id: 'user_real', email: '', native_lang: 'en', current_level: 1, xp: 0, streak: 0, daily_goal_minutes: 15, learning_goal: 'travel', created_at: '2026-01-01', isPro: false },
    });
    const { isPro } = require('../src/services/revenuecatService');
    isPro.mockReturnValueOnce(true);
    await useAuthStore.getState().syncProStatus();
    expect(useAuthStore.getState().user?.isPro).toBe(true);
  });

  it('getCustomerInfo가 실패해도 기존 isPro 상태를 유지한다', async () => {
    useAuthStore.setState({
      user: { id: 'user_real', email: '', native_lang: 'en', current_level: 1, xp: 0, streak: 0, daily_goal_minutes: 15, learning_goal: 'travel', created_at: '2026-01-01', isPro: false },
    });
    const { getCustomerInfo } = require('../src/services/revenuecatService');
    getCustomerInfo.mockRejectedValueOnce(new Error('network error'));
    await useAuthStore.getState().syncProStatus();
    expect(useAuthStore.getState().user?.isPro).toBe(false);
  });
});
