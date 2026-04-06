# Plan: Lesson Player Hardening

## Summary
Guard against double-execution of finishLesson (which would double XP/minutes), add zero-step protection, and tighten type safety in LessonCompleteScreen.

## Requirements
- [ ] REQ-1: Prevent `finishLesson` double-invocation via rapid double-tap
- [ ] REQ-2: Guard `lessonProgress` and `finishLesson` when `totalSteps === 0`
- [ ] REQ-3: Remove `as any` cast in LessonCompleteScreen nested tab navigation

## Acceptance Criteria
- [ ] AC-1: PronunciationPhase "next/finish" button is disabled after first press until navigation completes
- [ ] AC-2: `addXP`, `addTodayMinutes`, `updateProgress` are each called exactly once per lesson completion
- [ ] AC-3: `lessonProgress` evaluates to a value in [0, 1] even when `totalSteps === 0`
- [ ] AC-4: LessonCompleteScreen "Next Lesson" navigates without `as any` cast or uses a typed param

## Implementation Steps

### Phase 1: Double-tap Guard
- Step 1.1: Add `isFinishing` state (boolean) to `LessonPlayerScreen` → file: `hanuri/src/screens/lesson/LessonPlayerScreen.tsx`
- Step 1.2: Set `isFinishing = true` at the top of `finishLesson`, guard early return if already true → same file
- Step 1.3: Pass `isFinishing` as `disabled` prop to `PronunciationPhase` and apply to the next/finish button → same file

### Phase 2: Zero-step Guard
- Step 2.1: Change `lessonProgress = currentStep / totalSteps` to `totalSteps > 0 ? currentStep / totalSteps : 0` → same file

### Phase 3: Navigation Type
- Step 3.1: Use `CompositeNavigationProp` or cast only the param (not the whole navigate call) in LessonCompleteScreen → file: `hanuri/src/screens/lesson/LessonCompleteScreen.tsx`

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `hanuri/src/screens/lesson/LessonPlayerScreen.tsx` | Modify | isFinishing guard + zero-step guard |
| `hanuri/src/screens/lesson/LessonCompleteScreen.tsx` | Modify | Remove as-any cast |

## Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| isFinishing state causes re-render mid-navigation | LOW | navigation.replace is synchronous enough; state won't cause visible flicker |
| Zero-step lessons (totalSteps=0) skip all phases and go directly to finishLesson | LOW | Edge case only in dev/test data, not production lessons |

## Out of Scope
- Lesson replay/retry flow
- Pronunciation service error handling improvements
- Score algorithm changes
