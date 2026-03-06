-- ============================================================
-- HANURI Korean App - Initial Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. PROFILES (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  native_lang TEXT NOT NULL DEFAULT 'en',
  current_level INTEGER NOT NULL DEFAULT 1,
  learning_goal TEXT NOT NULL DEFAULT 'travel',
  daily_goal_minutes INTEGER NOT NULL DEFAULT 15,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. USER_STATS (XP, streak, daily minutes)
CREATE TABLE IF NOT EXISTS user_stats (
  user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp              INTEGER NOT NULL DEFAULT 0,
  streak          INTEGER NOT NULL DEFAULT 0,
  last_streak_date TEXT,
  today_minutes   INTEGER NOT NULL DEFAULT 0,
  last_active_date TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. LESSON_PROGRESS
CREATE TABLE IF NOT EXISTS lesson_progress (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id    TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'in_progress',
  score        INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (each user sees only their own data)
-- ============================================================
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats     ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- profiles policies
CREATE POLICY "profiles: own row" ON profiles
  USING (auth.uid() = id);
CREATE POLICY "profiles: own insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles: own update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- user_stats policies
CREATE POLICY "stats: own row" ON user_stats
  USING (auth.uid() = user_id);
CREATE POLICY "stats: own insert" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stats: own update" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- lesson_progress policies
CREATE POLICY "progress: own rows" ON lesson_progress
  USING (auth.uid() = user_id);
CREATE POLICY "progress: own insert" ON lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progress: own update" ON lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: auto-create profile + stats on new user signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO user_stats (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
