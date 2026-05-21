# Plan: RevenueCat 인앱 결제 연동

## Summary
현재 `__DEV__` 분기로 mock 처리된 ProUpgradeScreen의 결제 흐름을 RevenueCat SDK로 교체한다.
Monthly / Yearly / Lifetime 3개 상품을 Offerings API로 동적 로딩하고,
결제 성공 시에만 `upgradeToPro()`를 호출한다.
기존 UI 레이아웃과 `useT()` i18n 시스템은 변경하지 않는다.

## Requirements
- [ ] REQ-1: `react-native-purchases` 설치 및 app.json 플러그인 등록
- [ ] REQ-2: `EXPO_PUBLIC_REVENUECAT_API_KEY`를 .env에 추가
- [ ] REQ-3: `revenuecatService.ts` 신규 생성 — 초기화/구매/복원/사용자 연동 로직
- [ ] REQ-4: App.tsx에서 앱 시작 시 RevenueCat 초기화
- [ ] REQ-5: authStore.ts signIn/signOut 시 RC 사용자 로그인/로그아웃 연동
- [ ] REQ-6: ProUpgradeScreen — Offerings API로 상품 동적 로딩 (가격 하드코딩 제거)
- [ ] REQ-7: ProUpgradeScreen — Monthly/Yearly/Lifetime 3개 플랜 카드 표시
- [ ] REQ-8: ProUpgradeScreen — 구매 성공 시에만 `upgradeToPro()` 호출
- [ ] REQ-9: ProUpgradeScreen — 구매 복원(Restore Purchases) 버튼 추가
- [ ] REQ-10: 결제 실패/취소 시 사용자 친화적 에러 처리
- [ ] REQ-11: i18n — lifetime/restore/error 문자열 6개 언어 추가

## Acceptance Criteria
- [ ] AC-1: 앱 시작 시 콘솔에 RC 초기화 성공 로그가 찍힌다
- [ ] AC-2: ProUpgradeScreen 진입 시 RC Offerings에서 가격이 로딩된다 (스피너 → 가격 표시)
- [ ] AC-3: 상품 로딩 실패 시 에러 메시지가 표시된다 (크래시 없음)
- [ ] AC-4: Monthly/Yearly/Lifetime 3개 플랜이 기존 카드 스타일로 표시된다
- [ ] AC-5: 구매 버튼 탭 → RC 결제 시트가 올라온다
- [ ] AC-6: 구매 성공 → `authStore.user.isPro === true` 확인
- [ ] AC-7: 사용자 취소 → Alert 없이 로딩 해제
- [ ] AC-8: Restore Purchases 탭 → 이전 구매 복원 성공/실패 Alert 표시
- [ ] AC-9: 로그인 시 RC 사용자 ID = Supabase user.id 연동
- [ ] AC-10: `tsc --noEmit --skipLibCheck` 통과 (에러 0)

## Implementation Steps

### Phase 1: 패키지 + 환경변수 설정
- Step 1.1: `npx expo install react-native-purchases` 실행 → `hanuri/package.json`
- Step 1.2: `app.json` plugins에 `"react-native-purchases"` 추가 → `hanuri/app.json`
- Step 1.3: `hanuri/.env`에 `EXPO_PUBLIC_REVENUECAT_API_KEY=test_aNrgrIIyd3IhO-nke4NeTbZqpj` 추가

### Phase 2: RevenueCat 서비스 파일 생성
- Step 2.1: `hanuri/src/services/revenuecatService.ts` 신규 생성
  - `initRevenueCat(apiKey)` — Purchases.configure 래퍼
  - `loginUser(userId)` — Purchases.logIn 래퍼
  - `logoutUser()` — Purchases.logOut 래퍼
  - `getOfferings()` — Offerings 패키지 목록 반환
  - `purchasePackage(pkg)` — 구매 실행, CustomerInfo 반환
  - `restorePurchases()` — 구매 복원, CustomerInfo 반환
  - `isPro(customerInfo)` — entitlements.active에 'pro' 존재 여부 확인

### Phase 3: App.tsx 초기화
- Step 3.1: `initRevenueCat(process.env.EXPO_PUBLIC_REVENUECAT_API_KEY)` 호출을
  기존 notification 초기화 useEffect 내에 추가 → `hanuri/App.tsx`

### Phase 4: authStore.ts — RC 사용자 연동
- Step 4.1: `loginWithSupabase` 완료 후 `loginUser(supaUser.id)` 호출
- Step 4.2: `signOut` 시 `logoutUser()` 호출

### Phase 5: i18n — 신규 문자열 추가
- Step 5.1: `Translations.proUpgrade` 인터페이스에 추가:
  `lifetime`, `periodLifetime`, `subscribeLifetime`,
  `restore`, `restoreSuccess`, `restoreFailed`, `purchaseFailed`, `loadingProducts`
- Step 5.2: 6개 언어(en/ko/es/zh/ja/vi) 모두 값 추가

### Phase 6: ProUpgradeScreen.tsx — 실제 결제 플로우
- Step 6.1: `getOfferings()` 호출로 상품 동적 로딩 (useEffect + useState)
- Step 6.2: 플랜 타입 `'monthly' | 'yearly' | 'lifetime'`으로 확장
- Step 6.3: 하드코딩 가격(₩9,900/₩69,900) → `package.product.priceString`으로 교체
- Step 6.4: Lifetime 플랜 카드 추가 (기존 카드 스타일 동일하게 적용)
- Step 6.5: `handleSubscribe` → `purchasePackage(selectedPackage)` 실제 결제로 교체
- Step 6.6: 결제 성공 시 `isPro(customerInfo)` 확인 후 `upgradeToPro()` 호출
- Step 6.7: 사용자 취소(`PURCHASE_CANCELLED`) → Alert 없이 종료
- Step 6.8: Restore 버튼 추가 → `restorePurchases()` 호출
- Step 6.9: 상품 로딩 중 스피너 표시, 로딩 실패 시 에러 메시지 표시

### Phase 7: 타입 체크
- Step 7.1: `tsc --noEmit --skipLibCheck`

## Files to Modify
| File | Action | Description |
|------|--------|-------------|
| `hanuri/.env` | Modify | RC API 키 추가 |
| `hanuri/app.json` | Modify | react-native-purchases 플러그인 추가 |
| `hanuri/App.tsx` | Modify | RC 초기화 추가 |
| `hanuri/src/services/revenuecatService.ts` | **Create** | RC 로직 캡슐화 |
| `hanuri/src/store/authStore.ts` | Modify | 로그인/로그아웃 시 RC 사용자 연동 |
| `hanuri/src/i18n/translations.ts` | Modify | 8개 신규 문자열 × 6개 언어 |
| `hanuri/src/screens/pro/ProUpgradeScreen.tsx` | Modify | 실제 결제 플로우 구현 |

## Dependencies
- `react-native-purchases` — RevenueCat 공식 React Native SDK
- 추가 외부 라이브러리 없음

## Risks & Mitigations
| Risk | Severity | Mitigation |
|------|----------|------------|
| Expo Go에서 react-native-purchases 미지원 | HIGH | `Platform.OS` + `__DEV__` 분기로 Expo Go 환경 감지, mock 모드 fallback |
| RC Offerings 로딩 실패 (네트워크) | MEDIUM | try/catch + 에러 상태 표시, 재시도 없이 사용자에게 안내 |
| test key로는 실제 결제 불가 | MEDIUM | 개발 테스트는 RC 샌드박스(Google Play sandbox) 사용 안내 |
| entitlement ID 불일치 | MEDIUM | RC 대시보드 entitlement ID를 `'pro'`로 통일 — 다르면 상수로 관리 |
| Lifetime 카드 3개 → 가로 레이아웃 좁아짐 | LOW | 기존 flex:1 패턴 유지, 글자 크기 조정 없이 진행 |

## Out of Scope
- 서버 측 구매 검증 (Supabase Edge Function via RC webhook)
- 구독 만료/갱신 실시간 감지 (CustomerInfo 폴링)
- 프로모션 코드, 무료 체험 기간 UI
- iOS 결제 연동 (현재는 Android Play Store 우선)
