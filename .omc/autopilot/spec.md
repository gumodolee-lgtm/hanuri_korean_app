# Autopilot Spec: Hanuri Korean App — Maestro E2E 테스트

**생성일:** 2026-06-07  
**대상 앱:** Hanuri Korean App (Expo SDK 54, React Native)  
**번들 ID:** com.hanuri.app

---

## 목적

사람의 수동 테스트 없이 주요 사용자 플로우가 정상 동작하는지 자동으로 검증한다.  
Maestro를 사용하여 골든 패스와 핵심 엣지 케이스를 커버한다.

---

## 테스트 도구 선택: Maestro

- **이유**: Expo/React Native 앱에서 가장 쉽게 설정 가능한 E2E 프레임워크
- **실행**: `maestro test .maestro/` (기기 또는 시뮬레이터 연결 필요)
- **특징**: YAML 기반, testID 또는 텍스트 기반 요소 탐색

---

## 커버할 플로우 (우선순위 순)

### Flow 1: 온보딩 → 홈 (최우선)
**설명:** 앱 첫 실행 시 언어 선택 → 학습 목표 → 레벨 선택 → 알림 설정 → 홈 화면 도달
**검증 포인트:**
- SplashScreen 렌더링 확인
- "Start for Free" 버튼 탭 → 온보딩 시작
- 언어 선택 (English)
- 목표 선택 (Travel/K-pop)
- 레벨 선택 (Absolute Beginner)
- 알림 스킵 → 홈 화면 진입
- 홈 화면에 streak, XP 위젯 표시 확인

### Flow 2: 레슨 골든 패스 (핵심)
**설명:** 레슨 탭 → 첫 레슨 선택 → 플래시카드 → 퀴즈 → 레슨 완료 → XP 획득
**검증 포인트:**
- 하단 탭 "Lessons" 탭 탭
- 레벨 1 첫 레슨 (Basic Greetings) 탭
- LessonPlayerScreen 진입 확인
- 플래시카드 스와이프/Next 탭
- 퀴즈 정답 선택
- 레슨 완료 화면 진입 확인
- XP 획득 메시지 확인

### Flow 3: AI 채팅 시나리오 선택 (HIGH)
**설명:** AI Chat 탭 → 카페 시나리오 선택 → 메시지 전송 → 응답 확인
**검증 포인트:**
- "AI Chat" 탭 탭
- AIHubScreen 렌더링 (시나리오 목록)
- "카페에서" 시나리오 탭
- AIChatScreen 진입
- 텍스트 입력 → 전송
- AI 응답 표시 확인

### Flow 4: 프로필 화면 (MEDIUM)
**설명:** 프로필 탭 → 사용자 정보 표시 → 언어 변경
**검증 포인트:**
- "Profile" 탭 탭
- ProfileScreen 렌더링
- XP, streak, level 표시 확인
- 일일 목표 변경 (15분 → 30분)

### Flow 5: 리더보드 (MEDIUM)
**설명:** 리더보드 탭 → 랭킹 목록 표시 (mock fallback 포함)
**검증 포인트:**
- "Ranking" 탭 탭
- LeaderboardScreen 렌더링
- 리더보드 항목 1개 이상 표시

---

## testID 매핑 필요 (구현 시 추가)

| 컴포넌트 | testID |
|---------|--------|
| SplashScreen "Start for Free" | `btn-start-free` |
| 언어 선택 항목 | `lang-en`, `lang-ko` 등 |
| 목표 선택 항목 | `goal-travel`, `goal-kpop` 등 |
| 레벨 선택 | `level-absolute` |
| 알림 스킵 버튼 | `btn-skip-notif` |
| 하단 탭 Home | `tab-home` |
| 하단 탭 Lessons | `tab-lessons` |
| 하단 탭 AI Chat | `tab-ai-chat` |
| 하단 탭 Ranking | `tab-ranking` |
| 하단 탭 Profile | `tab-profile` |
| 레슨 시작 버튼 | `btn-start-lesson` |
| 레슨 다음 버튼 | `btn-next` |
| 레슨 완료 화면 | `screen-lesson-complete` |
| AI 채팅 입력 | `input-chat` |
| AI 채팅 전송 | `btn-send` |

---

## 기술 제약

1. Maestro는 실제 기기 또는 시뮬레이터가 필요 (CI에서는 Android Emulator / iOS Simulator)
2. 온보딩 플로우 테스트는 앱 재설치 또는 AsyncStorage 초기화 필요
3. Supabase가 없으면 mock 모드로 동작 → AI 응답은 mock 텍스트
4. 오디오/마이크 권한은 테스트 환경에서 자동 허용 필요

---

## 파일 구조

```
.maestro/
  flows/
    01_onboarding.yaml
    02_lesson_golden_path.yaml
    03_ai_chat.yaml
    04_profile.yaml
    05_leaderboard.yaml
  config.yaml
```
