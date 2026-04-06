# Plan: Profile Screen Hardening

## Summary
Add sign-out confirmation dialog to prevent accidental logout, and guard xpProgress from NaN when level is zero.

## Requirements
- [ ] REQ-1: Show confirmation Alert before executing signOut
- [ ] REQ-2: Guard `xpForNext === 0` in xpProgress calculation

## Acceptance Criteria
- [ ] AC-1: Tapping sign-out button shows Alert with cancel and confirm options before calling signOut()
- [ ] AC-2: signOut() is NOT called when user dismisses the confirmation dialog
- [ ] AC-3: `xpProgress` is always a value in [0, 1] even when `currentLevel === 0`

## Implementation Steps

### Phase 1: Sign-out Confirmation
- Step 1.1: Replace `onPress={signOut}` with `onPress={() => handleSignOut()}` on the sign-out button
- Step 1.2: Implement `handleSignOut` function that shows `Alert.alert` with cancel + confirm → file: `hanuri/src/screens/profile/ProfileScreen.tsx`
- Step 1.3: Use existing `t.profile` i18n keys — check if signOutConfirm keys exist, add if not → file: `hanuri/src/i18n/index.ts`

### Phase 2: XP Guard
- Step 2.1: Change `xpForNext = currentLevel * 100` guard: `const xpForNext = Math.max(currentLevel * 100, 1)` → same file

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `hanuri/src/screens/profile/ProfileScreen.tsx` | Modify | handleSignOut + xpForNext guard |
| `hanuri/src/i18n/index.ts` | Modify | Add signOut confirm i18n keys (if missing) |

## Out of Scope
- Daily goal / native language edit UI (known limitation)
- vocab_100 badge semantic alignment (design decision)
- Notification time customization
