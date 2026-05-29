# 매뉴얼 개요 — Hanuri Korean App

## 매뉴얼 목록

| 파일 | 내용 | 언제 참고? |
|------|------|-----------|
| `MANUAL_SCREENS.md` | 스크린/컴포넌트 구조, SafeAreaView, Hook 규칙 | UI 코드 수정 시 |
| `MANUAL_STATE.md` | Zustand store, 게스트 처리, 로그아웃, 달성 조건 | 상태 관련 코드 수정 시 |
| `MANUAL_SUPABASE.md` | Supabase 인증, DB 접근, 환경변수 보안 | 백엔드/인증 코드 수정 시 |
| `MANUAL_I18N.md` | useT() 훅, 6개 언어, TTS | 다국어/번역 관련 수정 시 |

## 자동 매칭 기준

### 키워드 기반
- component, screen, UI, layout, style, SafeAreaView → `MANUAL_SCREENS.md`
- store, zustand, state, persist, addXP, streak → `MANUAL_STATE.md`
- supabase, auth, login, DB, query, signOut → `MANUAL_SUPABASE.md`
- i18n, useT, 번역, language, TTS → `MANUAL_I18N.md`

### 파일 경로 기반
- `hanuri/src/screens/**`, `hanuri/src/components/**` → `MANUAL_SCREENS.md`
- `hanuri/src/store/**` → `MANUAL_STATE.md`
- `hanuri/src/services/**` → `MANUAL_SUPABASE.md`
- `hanuri/src/i18n/**` → `MANUAL_I18N.md`

## 기능 문서 템플릿
새 기능 작업 시 아래 예시 파일을 복사하여 사용:
- `FEATURE_PLAN.example.md` → `feature_<이름>_plan.md`
- `FEATURE_CONTEXT.example.md` → `feature_<이름>_context.md`
- `FEATURE_TODO.example.md` → `feature_<이름>_todo.md`
