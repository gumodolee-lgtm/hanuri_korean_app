# Plan: Apple Login

## Summary
iOS App Store 출시 요건(소셜 로그인 제공 시 Apple Login 필수)을 충족하기 위해,
현재 "Coming Soon" Alert 상태인 Apple 버튼을 실제 동작하도록 구현한다.
`expo-apple-authentication`(네이티브 Apple Sign In UI) + Supabase `signInWithIdToken` 패턴 사용.
Google OAuth 이후 post-login 흐름(게스트 데이터 이전, loadFromRemote)을 그대로 재사용한다.

## Requirements
- [ ] REQ-1: iOS에서 Apple 버튼 탭 시 native Apple Sign In 대화상자가 표시된다
- [ ] REQ-2: 로그인 성공 시 Supabase 세션이 생성되고 authStore에 사용자 정보가 저장된다
- [ ] REQ-3: 로그인 성공 시 서버 데이터(`loadFromRemote`)를 불러온다
- [ ] REQ-4: 게스트 데이터가 있으면 서버 데이터가 비어있을 경우 이전한다 (Google과 동일 로직)
- [ ] REQ-5: 사용자가 Apple 대화상자를 취소하면 에러 Alert 없이 조용히 종료된다
- [ ] REQ-6: Android에서는 Apple 버튼이 숨겨지거나 비활성화 표시된다
- [ ] REQ-7: Expo Go에서는 Apple 버튼이 비활성화 표시되며 안내 Alert를 보여준다
- [ ] REQ-8: 로딩 중 `ActivityIndicator`를 표시하고 버튼을 `disabled` 처리한다

## Acceptance Criteria
- [ ] AC-1: iOS 기기/시뮬레이터에서 Apple 버튼 탭 → Apple Sign In 시트가 올라온다
- [ ] AC-2: 로그인 성공 → `authStore.user.id`가 Supabase UUID와 일치한다
- [ ] AC-3: 로그인 성공 → `MainTabs` 화면으로 자동 이동한다 (RootNavigator onAuthStateChange 처리)
- [ ] AC-4: 취소 시 (`ERR_REQUEST_CANCELED`) → Alert 없이 로딩 상태만 해제된다
- [ ] AC-5: 네트워크 에러 또는 Supabase 에러 → `t.splash.loginFailedTitle` Alert가 뜬다
- [ ] AC-6: Android 빌드에서 Apple 버튼이 렌더링되지 않거나 `opacity: 0` 처리된다
- [ ] AC-7: TypeScript 타입 에러 없음 (`tsc --noEmit` 통과)

## Implementation Steps

### Phase 1: 패키지 설치 + app.json 설정
- Step 1.1: `expo-apple-authentication` 설치 → `hanuri/package.json`에 의존성 추가
  ```bash
  cd hanuri && npx expo install expo-apple-authentication
  ```
- Step 1.2: `app.json` iOS 섹션에 `usesAppleSignIn: true` 추가 → `hanuri/app.json`
- Step 1.3: `app.json` plugins 배열에 `"expo-apple-authentication"` 추가 → `hanuri/app.json`

### Phase 2: SplashScreen — handleAppleLogin 구현
- Step 2.1: `expo-apple-authentication` import 추가 → `hanuri/src/screens/auth/SplashScreen.tsx`
- Step 2.2: `Platform` import 추가 (react-native) → 같은 파일
- Step 2.3: `isAppleLoading` state 추가 (`useState(false)`) → 같은 파일
- Step 2.4: `handleAppleLogin` async 함수 구현:
  1. `AppleAuthentication.isAvailableAsync()` → false이면 안내 Alert 후 리턴
  2. `AppleAuthentication.signInAsync({ requestedScopes: [FULL_NAME, EMAIL] })` 호출
  3. `ERR_REQUEST_CANCELED` 에러 코드 시 조용히 리턴
  4. `supabase.auth.signInWithIdToken({ provider: 'apple', token: credential.identityToken! })` 호출
  5. 세션에서 `supaUser` 추출 → Google 로그인과 동일한 post-login 흐름 실행
  6. `appUser` 생성 → `loginWithSupabase(appUser)` → `loadFromRemote(userId)` → 게스트 데이터 이전
- Step 2.5: Apple 버튼 JSX 수정:
  - `opacity: 0.6` → 제거 (정상 스타일)
  - `onPress` → `handleAppleLogin`
  - `disabled={isAppleLoading || !isSupabaseConfigured}`
  - `!isSupabaseConfigured` 시 `styles.socialButtonDisabled` 적용
  - `isAppleLoading` 시 `ActivityIndicator` 렌더링
  - `Platform.OS !== 'ios'` 시 렌더링 자체를 null로 (REQ-6)

### Phase 3: i18n — 필요 시 문자열 추가
- Step 3.1: 기존 `t.splash.loginFailedTitle`, `t.splash.loginFailedMsg`가 Apple 에러에도 재사용 가능한지 확인
- Step 3.2: 재사용 가능하면 추가 번역 불필요; `t.splash.appleNotAvailable` 등이 필요하면 6개 언어에 추가

### Phase 4: 타입 체크
- Step 4.1: `tsc --noEmit --skipLibCheck` 실행, 에러 0개 확인

## Files to Modify
| File | Action | Description |
|------|--------|-------------|
| `hanuri/package.json` | Modify | `expo-apple-authentication` 의존성 추가 |
| `hanuri/app.json` | Modify | iOS `usesAppleSignIn: true`, plugin 추가 |
| `hanuri/src/screens/auth/SplashScreen.tsx` | Modify | `handleAppleLogin` 구현, Apple 버튼 활성화 |
| `hanuri/src/i18n/translations.ts` | Modify (조건부) | Apple 관련 에러 문자열 (재사용 가능하면 변경 불필요) |

## Dependencies
- `expo-apple-authentication` — Expo 공식 패키지, EAS Build에서 동작 (Expo Go 미지원)
- 새 외부 라이브러리 없음 — 나머지는 이미 설치된 패키지 활용

## External Setup Required (빌드 전 필수)
| 설정 | 위치 | 내용 |
|------|------|------|
| Sign In with Apple capability | Apple Developer Console → Identifiers → `com.hanuri.app` | Sign In with Apple 활성화 |
| Apple Services ID | Apple Developer Console | Web 인증 리다이렉트용 (Supabase에 등록) |
| Supabase Apple Provider | Supabase Dashboard → Auth → Providers → Apple | Team ID, Bundle ID, Key ID, Private Key 입력 |

> **개발 중 참고**: Expo Go에서는 `expo-apple-authentication`을 사용할 수 없음.
> 테스트는 `eas build --profile development` 또는 iOS 시뮬레이터 개발 빌드에서만 가능.

## Risks & Mitigations
| Risk | Severity | Mitigation |
|------|----------|------------|
| Expo Go에서 `expo-apple-authentication` 미지원 | HIGH | `isAvailableAsync()` 체크로 우아하게 처리; 개발은 EAS dev build 사용 |
| Apple Developer / Supabase 설정 미완료 시 런타임 에러 | HIGH | `isSupabaseConfigured` 가드 + `isAvailableAsync()` 가드로 에러 차단 |
| identityToken이 null일 때 크래시 | MEDIUM | `!credential.identityToken` 체크 후 에러 throw |
| Android 빌드에서 Apple 버튼 import 에러 | LOW | `expo-apple-authentication`은 Android에서 stub 제공 — `isAvailableAsync()`가 false 반환 |
| Apple이 email을 최초 로그인 시에만 제공 | LOW | `displayName` fallback: `supaUser.email` 앞부분 사용 |

## Out of Scope
- Supabase Apple Provider 실제 설정 (Apple Developer 계정 작업 — 사용자가 수동 진행)
- Android에서 Apple Login 지원 (Apple 정책상 불가)
- Apple ID 연동 해제 (설정 → 계정 삭제 흐름)
- 기존 Google 계정과 같은 이메일로 Apple Login 시 계정 병합

---

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | — | — |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

**VERDICT:** NO REVIEWS YET
