# Plan: Onboarding Level Test Result Fix

## Summary
Fix OnboardingLevelScreen to initialize selected level from onboardingData, so the level test result is pre-selected when the user returns from the test.

## Requirements
- [ ] REQ-1: LevelScreen initializes `selected` from `onboardingData.currentLevel` if available

## Acceptance Criteria
- [ ] AC-1: After completing level test and pressing "이 레벨로 시작하기 →", returning to LevelScreen shows the test-suggested level pre-selected
- [ ] AC-2: If user hasn't taken the test, default selection remains 1
- [ ] AC-3: Pressing "다음" saves the currently displayed (pre-selected) level, not the hardcoded default 1

## Implementation Steps
- Step 1: Add `onboardingData` to destructured state from `useAuthStore()` in LevelScreen
- Step 2: Change `useState(1)` to `useState(onboardingData.currentLevel ?? 1)`

## Files to Modify
| File | Action | Description |
|------|--------|-------------|
| `hanuri/src/screens/onboarding/OnboardingLevelScreen.tsx` | Modify | Initialize selected from onboardingData |

## Out of Scope
- Progress dot count (5 dots, 6 screens — LevelTest is optional/branching step)
- Notification dots showing all-active (correct for final step)
