# 구현 플랜: Hanuri E2E Maestro 테스트

## 구현 순서

### Step 1: testID 추가 (소스 코드)
필요한 화면에 `testID` prop 추가:
- SplashScreen: "Start for Free" 버튼, "Continue as Guest" 버튼
- OnboardingLanguageScreen: 언어 옵션 버튼들, Next 버튼
- OnboardingGoalScreen: 목표 옵션들
- OnboardingLevelScreen: 레벨 옵션들
- OnboardingNotificationScreen: Skip 버튼, Allow 버튼
- MainTabNavigator: 하단 탭 버튼들
- LessonsScreen: 레슨 카드 버튼들
- LessonPlayerScreen: Next 버튼, 퀴즈 선택지들
- LessonCompleteScreen: 완료 화면 컨테이너
- AIHubScreen: 시나리오 카드들
- AIChatScreen: 채팅 입력, 전송 버튼

### Step 2: Maestro 설정 파일
- `.maestro/config.yaml` — 앱 bundleId 설정

### Step 3: Maestro Flow 파일 작성 (5개)
- `.maestro/flows/01_onboarding.yaml`
- `.maestro/flows/02_lesson_golden_path.yaml`
- `.maestro/flows/03_ai_chat.yaml`
- `.maestro/flows/04_profile.yaml`
- `.maestro/flows/05_leaderboard.yaml`

### Step 4: 실행 스크립트
- `package.json`에 `"e2e": "maestro test .maestro/flows/"` 추가
- `.maestro/README.md` — 실행 방법 문서

## 수용 기준 (Acceptance Criteria)
- [ ] 5개 YAML 플로우 파일이 문법 오류 없이 작성됨
- [ ] testID가 실제 컴포넌트에 추가됨
- [ ] `maestro test` 실행 가능한 config.yaml 존재
- [ ] README에 로컬 실행 방법 기술됨
