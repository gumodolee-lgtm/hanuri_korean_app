-- ============================================================
-- HANURI Korean App - Remote App Config (key-value)
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
--
-- Background: tunable values (e.g. the free vs. PRO lesson-level
-- boundary) were hardcoded in the app bundle, meaning any change
-- required a full app store release. This adds a public-readable
-- key-value config table so such values can be adjusted from the
-- Supabase dashboard without shipping a new build.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.app_config (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- app_config: 누구나 조회 가능 (공개 설정값), 쓰기는 대시보드에서만 수동으로
CREATE POLICY "app_config_select_all" ON public.app_config
  FOR SELECT USING (true);

-- 초기값: 레벨 1-6 무료, 7부터 PRO 결제 필요
INSERT INTO public.app_config (key, value) VALUES ('free_max_level', '6')
  ON CONFLICT (key) DO NOTHING;
