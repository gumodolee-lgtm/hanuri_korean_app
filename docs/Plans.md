# Plan: Profile Edit UI

## Summary
Allow users to edit their daily goal (5/15/30 min) and native language directly from the Profile screen, persisting changes to authStore and syncing to Supabase for authenticated users.

## Requirements
- [x] REQ-1: Daily goal row in ProfileScreen is tappable and opens a picker modal
- [x] REQ-2: Native language row is tappable and opens a picker modal
- [x] REQ-3: Selected value is saved to authStore.user and synced to Supabase (non-blocking)
- [x] REQ-4: Guest users can edit locally (no Supabase sync — already handled by `syncProfile` isGuest guard)
- [x] REQ-5: authStore exposes `updateProfile()` action for patching user fields
- [x] REQ-6: All new strings go through `useT()` i18n

## Acceptance Criteria
- [x] AC-1: Tapping "Daily Goal" row opens a modal with 3 options (5min / 15min / 30min)
- [x] AC-2: Tapping "Native Language" row opens a modal with 6 language options
- [x] AC-3: Selecting an option and confirming updates the displayed value immediately
- [x] AC-4: After save, `authStore.user.daily_goal_minutes` / `native_lang` reflects the new value
- [x] AC-5: For authenticated users, `syncProfile` is called with the updated user object
- [x] AC-6: Modal can be dismissed without saving (Cancel preserves old value)
- [x] AC-7: Both modals work in all 6 supported languages (i18n)

## Implementation Steps

### Phase 1: authStore — updateProfile action
- Step 1.1: Add `updateProfile(partial: Partial<Pick<User, 'native_lang' | 'daily_goal_minutes' | 'learning_goal'>>): void` to `AuthState` interface → file: `hanuri/src/store/authStore.ts`
- Step 1.2: Implement `updateProfile`: `set` updated user, then fire-and-forget `syncProfile` → same file

### Phase 2: i18n — add edit strings
- Step 2.1: Add to `Translations.profile` interface: `editDailyGoal`, `editNativeLang`, `save`, `min5`, `min15`, `min30` → file: `hanuri/src/i18n/translations.ts`
- Step 2.2: Add values for all 6 languages (en, ko, es, zh, ja, vi) → same file

### Phase 3: ProfileScreen — edit modals
- Step 3.1: Add `useState` for `showGoalModal` and `showLangModal` → file: `hanuri/src/screens/profile/ProfileScreen.tsx`
- Step 3.2: Make "Daily Goal" setting row a `TouchableOpacity`, `onPress` → `setShowGoalModal(true)`
- Step 3.3: Make "Native Language" setting row a `TouchableOpacity`, `onPress` → `setShowLangModal(true)`
- Step 3.4: Implement `GoalPickerModal` — `Modal` with 3 `TouchableOpacity` options (5/15/30min), Cancel + Save buttons
- Step 3.5: Implement `LangPickerModal` — `Modal` with 6 language options (flag + label), Cancel + Save buttons
- Step 3.6: On save: call `updateProfile({ daily_goal_minutes: selected })` / `updateProfile({ native_lang: selected })`
- Step 3.7: Add `updateProfile` to imports from `useAuthStore`

## Files to Modify
| File | Action | Description |
|------|--------|-------------|
| `hanuri/src/store/authStore.ts` | Modify | Add `updateProfile` action |
| `hanuri/src/i18n/translations.ts` | Modify | Add edit strings to `profile` section (6 langs) |
| `hanuri/src/screens/profile/ProfileScreen.tsx` | Modify | Make rows tappable, add two edit modals |

## Dependencies
- No new libraries — uses `Modal` from `react-native` (already used in codebase via Alert)
- `syncProfile` from `dbService` — already imported in authStore

## Risks & Mitigations
| Risk | Severity | Mitigation |
|------|----------|------------|
| `syncProfile` failure silently drops edit | LOW | fire-and-forget with `.catch(() => {})` — local state already updated |
| Modal blocks scroll on small screens | LOW | `ScrollView` inside modal for language list (6 items) |
| Language change doesn't update `useT()` immediately | MEDIUM | `useT()` reads from authStore.user.native_lang reactively — update happens in same render cycle |

## Out of Scope
- Editing `learning_goal` (requires more UI space; can be added in next iteration)
- Editing display name or email
- Profile photo upload
- Deleting account
