# Plan: Leaderboard Real Data Integration

## Summary
Connect LeaderboardScreen to Supabase user_stats, show real top-10 with loading/error states and the current user's true rank. Fall back to mock data gracefully for guests and on network errors.

## Requirements
- [x] REQ-1: Add `fetchLeaderboard()` to dbService.ts — queries user_stats + profiles, returns top 10 by XP
- [x] REQ-2: LeaderboardScreen shows loading indicator while fetching
- [x] REQ-3: Current user's real XP/streak/level appears at correct rank position
- [x] REQ-4: Guest users and network errors fall back to mock data (no crash)
- [x] REQ-5: Add RefreshControl (pull-to-refresh)

## Acceptance Criteria
- [x] AC-1: Authenticated user sees a loading spinner on first mount
- [x] AC-2: After load, top 10 rows show real data (xp, streak, level from DB) or mock on error
- [x] AC-3: Current user row always shows their real xp/streak from userStore (not DB — avoids stale)
- [x] AC-4: Guest users see mock data with no error thrown
- [x] AC-5: Pull-to-refresh re-fetches and updates the list
- [x] AC-6: If user is in top 10, their row is highlighted (isMe); if not, their row appears below with separator

## Implementation Steps

### Phase 1: dbService — fetchLeaderboard
- Step 1.1: Add `LeaderEntry` interface: `{ userId: string; xp: number; streak: number; level: number; nativeLang: string }` → file: `hanuri/src/services/dbService.ts`
- Step 1.2: Implement `fetchLeaderboard(limit = 10)` — query `user_stats` ordered by xp desc, join profiles for current_level + native_lang. Return empty array on error. → same file

### Phase 2: LeaderboardScreen — real data
- Step 2.1: Add `useState` for `leaders`, `loading`, `refreshing` → file: `hanuri/src/screens/profile/LeaderboardScreen.tsx`
- Step 2.2: `useEffect` on mount: if authenticated, call `fetchLeaderboard()`, set leaders; else use MOCK_LEADERS
- Step 2.3: Map `LeaderEntry` to display rows — `nativeLang` → flag emoji, `userId` masked as "학습자 #N"
- Step 2.4: Inject current user's real data at correct rank position (compare xp from userStore)
- Step 2.5: Add `<RefreshControl>` on ScrollView

### Phase 3: Display flags mapping
- Step 3.1: Add `LANG_TO_FLAG` map (`en→🇺🇸, ko→🇰🇷, es→🇪🇸, zh→🇨🇳, ja→🇯🇵, vi→🇻🇳`) → in LeaderboardScreen

## Files to Modify
| File | Action | Description |
|------|--------|-------------|
| `hanuri/src/services/dbService.ts` | Modify | Add fetchLeaderboard() |
| `hanuri/src/screens/profile/LeaderboardScreen.tsx` | Modify | Real data, loading, refresh |

## Risks & Mitigations
| Risk | Severity | Mitigation |
|------|----------|------------|
| Supabase RLS blocks cross-user read on user_stats | HIGH | Catch error, fall back to MOCK_LEADERS silently |
| No display_name in schema — must show anonymous | LOW | Show "학습자 #N" (respects user privacy by design) |
| Real top-10 may not include current user | LOW | Always append current user row below separator if rank > 10 |

## Out of Scope
- DB schema changes (no display_name column addition)
- RLS policy changes (handled server-side separately)
- Weekly vs all-time filter toggle
