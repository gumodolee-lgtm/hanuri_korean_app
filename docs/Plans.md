# Plan: Store Layer Bug Fix (Harness Review)

## Summary
Zustand store 레이어(userStore, authStore)에서 발견된 날짜 경계 버그 3개와
데드코드 2개를 수정한다. 이전 세션의 7개 버그 수정에 이어, 이번 세션에서
Harness Engineering 기법으로 검토 중 추가 발견된 항목들이다.

---

## Requirements

- [ ] REQ-1: `todayMinutes`가 날짜 경계(자정 이후 첫 레슨 완료) 시 올바르게 누적되어야 함
- [ ] REQ-2: `checkAndUpdateStreak` 함수가 코드베이스에서 완전히 제거되어야 함
- [ ] REQ-3: 앱을 새로운 날에 열 때 `todayMinutes`와 `todayLearned`가 초기화되어야 함
- [ ] REQ-4: `unlockBadge` 미사용 함수가 코드베이스에서 완전히 제거되어야 함
- [ ] REQ-5: `aiChatCount`의 로컬 전용 설계 의도가 코드에 명시되어야 함

---

## Acceptance Criteria

- [ ] AC-1: 자정이 지난 뒤 레슨을 완료하면 `todayMinutes`가 레슨 시간(estimatedMinutes)과 일치해야 함 (이전 날 누적값에 더해지지 않음)
- [ ] AC-2: `grep -rn "checkAndUpdateStreak"` 결과가 0건이어야 함
- [ ] AC-3: `checkNewDay()`가 `userStore`에 존재하고, `HomeScreen` 마운트 시 호출됨
- [ ] AC-4: 새 날에 HomeScreen이 열리면 `todayMinutes === 0`, `todayLearned === false`
- [ ] AC-5: `grep -rn "unlockBadge"` 결과가 0건이어야 함
- [ ] AC-6: `incrementAIChatCount` 함수에 로컬 전용 설계 이유를 서술한 주석이 있어야 함
- [ ] AC-7: TypeScript 컴파일 에러 없이 빌드 성공

---

## Implementation Steps

### Phase 1: LessonPlayerScreen — 호출 순서 수정 (Bug #8)
- Step 1.1: `finishLesson()` 내 `markTodayLearned(userId)` 를 `addTodayMinutes()` 앞으로 이동
  → file: `hanuri/src/screens/lesson/LessonPlayerScreen.tsx`

### Phase 2: userStore — 데드코드 제거 및 기능 추가 (Bug #9, #10, Gap #1, #2)
- Step 2.1: `checkAndUpdateStreak` 인터페이스 선언 제거
- Step 2.2: `checkAndUpdateStreak` 구현부 제거
- Step 2.3: `unlockBadge` 인터페이스 선언 제거
- Step 2.4: `unlockBadge` 구현부 제거
- Step 2.5: `checkNewDay()` 함수 추가 — lastStreakDate !== today 시 todayMinutes/todayLearned 리셋
- Step 2.6: `markTodayLearned` 두 개의 `set()` 호출을 하나로 통합
- Step 2.7: `incrementAIChatCount`에 로컬 전용 설계 주석 추가
  → file: `hanuri/src/store/userStore.ts`

### Phase 3: HomeScreen — 날짜 경계 처리 (Bug #10)
- Step 3.1: `useEffect` 추가 — 마운트 시 `checkNewDay()` 호출
  → file: `hanuri/src/screens/home/HomeScreen.tsx`

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `hanuri/src/store/userStore.ts` | Modify | 데드코드 2개 제거, checkNewDay 추가, markTodayLearned 단순화, 주석 추가 |
| `hanuri/src/screens/lesson/LessonPlayerScreen.tsx` | Modify | finishLesson 내 호출 순서 수정 |
| `hanuri/src/screens/home/HomeScreen.tsx` | Modify | checkNewDay useEffect 추가 |

---

## Dependencies

- 외부 라이브러리 추가 없음
- Zustand, AsyncStorage 기존 패턴 그대로 사용

---

## Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| markTodayLearned 순서 변경으로 streak 로직 변경 | HIGH | 기존 `if (lastStreakDate === today) return` 가드가 중복 호출을 방지하므로 안전 |
| checkNewDay가 streak을 잘못 리셋 | MED | `lastStreakDate`만 비교하고 streak 값은 건드리지 않음 — streak은 `markTodayLearned`에서만 변경 |
| unlockBadge 제거 시 ProfileScreen 영향 | LOW | ProfileScreen은 badges 배열이 아닌 직접 계산(xp, streak, aiChatCount)으로 배지 표시 중 — 영향 없음 |

---

## Out of Scope

- authStore 수정 (이번 계획 범위 밖)
- Supabase 스키마 변경 (aiChatCount 서버 동기화는 다음 사이클)
- 배지 시스템 재설계
- 알림 커스텀 시간 UI
- Leaderboard 실제 데이터 연결
