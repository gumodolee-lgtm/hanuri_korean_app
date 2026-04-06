# Plan: Auth Feature Cleanup

## Summary
Remove dead code, add Supabase session change listener, and fix navigation type safety for the auth/navigation layer.

## Requirements
- [ ] REQ-1: Remove `recordActivity` dead code from `authStore.ts`
- [ ] REQ-2: Add `onAuthStateChange` listener to sync Supabase session state with authStore
- [ ] REQ-3: Fix `AIHub` navigation type — remove unsafe `(navigation as any)` cast in HomeScreen
- [ ] REQ-4: Add error handling for `syncProfile` failure in `loginWithSupabase`

## Acceptance Criteria
- [ ] AC-1: `recordActivity` function and its interface entry are absent from `authStore.ts`
- [ ] AC-2: Grep for `recordActivity` returns 0 results in `*.ts` / `*.tsx` files
- [ ] AC-3: `onAuthStateChange` callback exists in `RootNavigator.tsx` (or `App.tsx`) and calls `logout()` when session is null
- [ ] AC-4: HomeScreen navigates to AIHub without `(navigation as any)` cast — uses typed navigation
- [ ] AC-5: `loginWithSupabase` catches `syncProfile` errors and logs/reports them without breaking the login flow
- [ ] AC-6: TypeScript build produces 0 new type errors

## Implementation Steps

### Phase 1: Dead Code Removal
- Step 1.1: Remove `recordActivity` from `UserState` interface → file: `hanuri/src/store/authStore.ts`
- Step 1.2: Remove `recordActivity` implementation body → file: `hanuri/src/store/authStore.ts`

### Phase 2: Session Listener
- Step 2.1: Add `supabase.auth.onAuthStateChange` listener in `RootNavigator.tsx` `useEffect` — call `logout()` when `event === 'SIGNED_OUT'` or `session === null` → file: `hanuri/src/navigation/RootNavigator.tsx`

### Phase 3: Navigation Type Fix
- Step 3.1: Determine correct approach — AIHub lives in `MainTabParamList`, not `RootStackParamList`. HomeScreen is rendered inside MainTabs, so navigation should use `useNavigation<BottomTabNavigationProp<MainTabParamList>>` → file: `hanuri/src/screens/home/HomeScreen.tsx`
- Step 3.2: Replace `(navigation as any).navigate('AIHub')` with typed `navigation.navigate('AIHub')` using `BottomTabNavigationProp` → file: `hanuri/src/screens/home/HomeScreen.tsx`

### Phase 4: Error Handling
- Step 4.1: Wrap `syncProfile` call in try/catch in `loginWithSupabase`, log error, continue → file: `hanuri/src/store/authStore.ts`

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `hanuri/src/store/authStore.ts` | Modify | Remove `recordActivity`, wrap `syncProfile` in try/catch |
| `hanuri/src/navigation/RootNavigator.tsx` | Modify | Add `onAuthStateChange` listener |
| `hanuri/src/screens/home/HomeScreen.tsx` | Modify | Fix `AIHub` navigation type cast |

## Dependencies
- None (all changes are within existing code)

## Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| `onAuthStateChange` fires on every token refresh, causing spurious logouts | HIGH | Only act on `SIGNED_OUT` event or when `session === null` AND user is currently logged in |
| Changing HomeScreen nav type breaks other navigation calls | LOW | Read full HomeScreen before editing; only change `handleAIChat` |
| `syncProfile` catch swallowing real errors silently | LOW | Console.warn the error so it's visible in dev |

## Out of Scope
- Apple Login implementation (marked as "Coming Soon" — separate feature)
- Guest→login data migration (already implemented in SplashScreen)
- Leaderboard Supabase connection (separate feature)
- ProUpgrade real billing
