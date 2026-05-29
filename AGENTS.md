# AGENTS.md — Project Instructions for Codex

## CRITICAL: Rules (모든 작업에 항상 적용)

### Rule 1 — 정확성 우선

답변을 작성하기 전에, 제공된 맥락(파일, 대화 내용) 내에서만 정보를 사용해라.
만약 정보가 충분하지 않거나 확실하지 않다면, 추측하지 말고 반드시
"정보가 부족하여 알 수 없습니다"라고 답해라.
목표는 정확성이지 창의성이 아니다.

### Rule 2 — 코딩 스타일 철저 준수

이 프로젝트의 기존 코딩 스타일, 폴더 구조, 사용 중인 라이브러리 패턴을
철저히 준수하라.
내가 명시하지 않은 새로운 라이브러리나 기술을 임의로 도입하지 마라.
코드를 수정하기 전에 해당 파일의 내용을 먼저 읽고 이해한 다음
변경 사항을 제안하라.

### Rule 3 — 단계별 논리 먼저

요청한 작업을 수행하기 전에 `<thinking>` 태그를 사용하여
단계별 논리 과정을 먼저 기술하라.
최종 코드는 `<result>` 태그 내에 작성하라.
논리적 근거가 부족하면 최종 답변을 생성하지 마라.

---

## Project: Hanuri Korean App

**비즈니스 목표:** 외국인 대상 K-콘텐츠 기반 실전 한국어 학습 앱

- 타겟: 영어권 K-콘텐츠 팬, 한국 여행/워홀 준비생
- 수익 모델: Freemium 구독 (월 $7.99 / 연 $49.99)
- 플랫폼: iOS App Store + Google Play Store

**기술 환경:**

- React Native / Expo SDK 54 + TypeScript
- Working directory: `hanuri/`
- Platforms: Android + iOS via Expo Go / EAS Build

---

## Tech Stack (변경 금지)

- **State**: Zustand + AsyncStorage persistence
- **Backend**: Supabase (auth, profiles, progress, user_stats)
- **Navigation**: React Navigation (Stack + BottomTab) ← Expo Router 사용 금지
- **i18n**: Custom `useT()` hook — 6 languages (en, ko, es, zh, ja, vi)
- **AI Chat**: Codex (Anthropic) or OpenAI — falls back to mock if keys not set
- **TTS**: expo-speech (Korean) ← 다른 TTS/STT 라이브러리 도입 금지
- **결제**: ProUpgrade UI 완성 (실제 결제 연동은 향후 RevenueCat 등으로 예정)

---

## Key Coding Rules

1. **파일 확인 우선**: 코드 수정 전 반드시 해당 파일 내용을 먼저 읽어라
2. **SafeAreaView**: `react-native-safe-area-context`에서만 import (react-native 금지)
3. **i18n 강제**: 모든 사용자 노출 문자열은 `useT()` 사용, 하드코딩 금지
4. **React 규칙**: 조건부 return 이후 hook 호출 금지
5. **ScrollView**: 전체 공간 채울 때 `style={{ flex: 1 }}` 필수
6. **Guest 처리**: `guest_` prefix 유저는 Supabase sync 금지, 로컬만 사용
7. **TypeScript**: strict 모드 준수, `any` 타입 지양
8. **에러 처리**: 모든 async 함수에 try/catch + 사용자 피드백 필수

---

## Monetization Rules (수익화 규칙)

- **무료 티어**: 기초 레벨(1-2), AI 대화 3회/일, 광고 포함
- **프리미엄**: 월 $7.99 / 연 $49.99 (연간 약 48% 할인)
- **무료 체험**: 연간 구독 시 3일 무료
- 프리미엄 기능 접근 시 → PaywallModal 표시 필수
- 결제 완료 전까지 프리미엄 콘텐츠 절대 노출 금지

---

## Environment Variables (hanuri/.env)

```env
EXPO_PUBLIC_SUPABASE_URL=https://bcfkuracrtjvmeeaitgh.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
EXPO_PUBLIC_ANTHROPIC_API_KEY=   # empty = mock AI responses
EXPO_PUBLIC_OPENAI_API_KEY=      # fallback if Anthropic not set
EXPO_PUBLIC_GOOGLE_TTS_API_KEY=  # optional
```
