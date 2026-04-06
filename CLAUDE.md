# CLAUDE.md — Project Instructions for Claude Code

## CRITICAL: Rules (모든 작업에 항상 적용)

### Rule 1 — 정확성
**답변을 작성하기 전에, 제공된 맥락(파일, 대화 내용) 내에서만 정보를 사용해라.**
**만약 정보가 충분하지 않거나 확실하지 않다면, 추측하지 말고 반드시 "정보가 부족하여 알 수 없습니다"라고 답해라.**
**목표는 정확성이지 창의성이 아니다.**

### Rule 2 — 코딩 스타일 준수
이 프로젝트의 기존 코딩 스타일, 폴더 구조, 사용 중인 라이브러리 패턴을 철저히 준수하라.
내가 명시하지 않은 새로운 라이브러리나 기술을 임의로 도입하지 마라.
코드를 수정하기 전에 해당 파일의 내용을 먼저 읽고 이해한 다음 변경 사항을 제안하라.

### Rule 3 — 단계별 논리 먼저
요청한 작업을 수행하기 전에 <thinking> 태그를 사용하여 단계별 논리 과정을 먼저 기술하라.
최종 코드는 <result> 태그 내에 작성하라.
논리적 근거가 부족하면 최종 답변을 생성하지 마라.

---

## Project: Hanuri Korean App

- React Native / Expo SDK 54 + TypeScript
- Working directory: `hanuri/`
- Platforms: Android + iOS via Expo Go / EAS Build

## Stack

- **State**: Zustand + AsyncStorage persistence
- **Backend**: Supabase (auth, profiles, progress)
- **Navigation**: React Navigation (Stack + BottomTab)
- **i18n**: Custom `useT()` hook — 6 languages (en, ko, es, zh, ja, vi)
- **AI Chat**: Claude (Anthropic) or OpenAI — falls back to mock if keys not set
- **TTS**: expo-speech (Korean)

## Key Rules

1. Read a file before editing it — never assume its contents
2. Use `SafeAreaView` from `react-native-safe-area-context` (NOT from `react-native`)
3. All user-facing strings go through `useT()` for i18n
4. Sub-components call `useT()` directly inside themselves
5. No hook calls after conditional returns (React rules)
6. `ScrollView` needs `style={{ flex: 1 }}` when it must fill remaining space
7. Guest users have `id` prefixed with `guest_` — no Supabase sync

## Environment Variables (hanuri/.env)

```
EXPO_PUBLIC_SUPABASE_URL=https://bcfkuracrtjvmeeaitgh.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
EXPO_PUBLIC_ANTHROPIC_API_KEY=   # empty = mock AI responses
EXPO_PUBLIC_OPENAI_API_KEY=      # fallback if Anthropic not set
EXPO_PUBLIC_GOOGLE_TTS_API_KEY=  # optional
```

## Known Shell/Unimplemented Features (do not pretend these work)

- ProUpgrade: simulated payment — no real billing
- AI Chat: uses mock responses (cycled Korean phrases) when API keys are empty
- Apple Login: shows "Coming Soon" alert

## Implemented Features (previously shell, now working)

- Leaderboard: connected to Supabase `user_stats` table; falls back to mock when DB is empty
- Profile: daily goal and native language are editable via modal pickers (updateProfile → syncProfile)

## MANDATORY: 구현 완료 후 교차 흐름 검증 (Cross-Flow Review)

기능 구현/수정 후 커밋 전에 반드시 아래를 검증하라. 사용자 요청 없이도 자동 수행.

### 검증 체크리스트

1. **Store 정리**: signOut/logout 시 authStore뿐 아니라 userStore 등 **모든 persist store**가 초기화되는가?
2. **인자 전달**: store 함수(addXP, addTodayMinutes 등)를 호출하는 **모든 지점**에서 userId가 전달되는가?
3. **달성 조건**: streak, 배지 등 달성 기능이 **실제 학습 행위**(레슨 완료 등)를 기반으로 판정하는가? (화면 진입만으로 달성되면 안 됨)
4. **게스트→로그인 이전**: 게스트로 쌓은 로컬 데이터가 로그인 시 **보존/이전**되는 경로가 있는가?
5. **UI-로직 일치**: UI에 보이는 옵션 수 === 실제 동작하는 핸들러 수인가? (비활성 옵션은 disabled 처리)
6. **키 노출**: EXPO_PUBLIC_* 변수에 비밀 API 키가 포함되어 있지 않은가?

### 검증 방법

```
grep -rn "함수명(" --include="*.ts" --include="*.tsx"  # 모든 호출 지점 확인
grep -rn "EXPO_PUBLIC_" --include="*.ts"                # 클라이언트 노출 키 확인
```
