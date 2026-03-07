-- ============================================================
-- HANURI 한국어 학습 앱 - Supabase 초기 스키마
-- Supabase 대시보드 > SQL Editor에서 실행하세요.
-- ============================================================

-- ─── EXTENSIONS ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────
-- Supabase auth.users와 1:1 연결되는 앱 사용자 프로필
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  native_lang   TEXT NOT NULL DEFAULT 'en'
                  CHECK (native_lang IN ('en','es','zh','ja','vi','ko')),
  current_level INTEGER NOT NULL DEFAULT 1 CHECK (current_level BETWEEN 1 AND 12),
  learning_goal TEXT NOT NULL DEFAULT 'travel'
                  CHECK (learning_goal IN ('kpop','travel','business','topik','relationship')),
  daily_goal_minutes INTEGER NOT NULL DEFAULT 15 CHECK (daily_goal_minutes IN (5, 15, 30)),
  is_pro        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 신규 가입 시 자동으로 profiles 행 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── USER_STATS ───────────────────────────────────────────────
-- XP, 스트릭, 오늘 학습 시간 (자주 업데이트되는 숫자들)
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id          UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  xp               INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  streak           INTEGER NOT NULL DEFAULT 0 CHECK (streak >= 0),
  last_streak_date DATE,
  today_minutes    INTEGER NOT NULL DEFAULT 0 CHECK (today_minutes >= 0),
  last_active_date DATE,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── LESSON_PROGRESS ─────────────────────────────────────────
-- 레슨별 진행 상태 및 점수
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id    TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'in_progress'
                 CHECK (status IN ('locked','in_progress','completed')),
  score        INTEGER NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, lesson_id)
);

-- ─── AI_CHAT_SESSIONS ────────────────────────────────────────
-- AI 대화 세션 기록 (분석용)
CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scenario_id  TEXT NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  xp_earned    INTEGER NOT NULL DEFAULT 0,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at     TIMESTAMPTZ
);

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_status  ON public.lesson_progress(status);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_user   ON public.ai_chat_sessions(user_id);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;

-- profiles: 본인만 조회/수정
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- user_stats: 본인만 조회/수정
CREATE POLICY "stats_select_own" ON public.user_stats
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "stats_upsert_own" ON public.user_stats
  FOR ALL USING (auth.uid() = user_id);

-- lesson_progress: 본인만 조회/수정
CREATE POLICY "progress_select_own" ON public.lesson_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "progress_upsert_own" ON public.lesson_progress
  FOR ALL USING (auth.uid() = user_id);

-- ai_chat_sessions: 본인만 조회/수정
CREATE POLICY "chat_select_own" ON public.ai_chat_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "chat_insert_own" ON public.ai_chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "chat_update_own" ON public.ai_chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- ─── LEADERBOARD VIEW (공개) ─────────────────────────────────
-- 랭킹 화면용 공개 뷰 (개인정보 최소화)
CREATE OR REPLACE VIEW public.leaderboard AS
  SELECT
    ROW_NUMBER() OVER (ORDER BY s.xp DESC) AS rank,
    p.id,
    p.current_level,
    s.xp,
    s.streak
  FROM public.profiles p
  JOIN public.user_stats s ON s.user_id = p.id
  ORDER BY s.xp DESC
  LIMIT 100;

-- ─── REALTIME ────────────────────────────────────────────────
-- 실시간 랭킹 업데이트를 위해 user_stats에 Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_stats;
