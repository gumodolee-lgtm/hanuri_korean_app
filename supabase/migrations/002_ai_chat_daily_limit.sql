-- ============================================================
-- HANURI Korean App - AI Chat Daily Free-Tier Limit (server sync)
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
--
-- Background: the free-tier "3 AI chats/day" limit was previously
-- enforced purely from local AsyncStorage state, which is wiped on
-- reinstall. This adds a server-synced daily counter so the limit
-- survives reinstalls for authenticated (non-guest) users.
-- ============================================================

ALTER TABLE user_stats
  ADD COLUMN IF NOT EXISTS today_ai_chat_count INTEGER NOT NULL DEFAULT 0;

-- last_active_date already exists and is used as the day-boundary
-- marker: if it doesn't match "today" on fetch, the client treats
-- today_ai_chat_count as stale and resets it to 0 locally.
