# Hanuri E2E Tests (Maestro)

## Setup

Install Maestro CLI:
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

## Running Tests

Run all flows:
```bash
cd hanuri
npm run e2e
# or from root:
maestro test .maestro/flows/
```

Run individual flows:
```bash
npm run e2e:onboarding    # Guest onboarding flow
npm run e2e:lessons       # Lesson golden path
npm run e2e:ai-chat       # AI chat (Cafe scenario)
npm run e2e:profile       # Profile screen
npm run e2e:leaderboard   # Leaderboard screen
```

## Flows

| File | Description | testIDs Used |
|------|-------------|-------------|
| `01_onboarding.yaml` | Guest signup → language → goal → level → home | btn-start-free, lang-en, goal-travel, level-1, btn-skip-notif |
| `02_lesson_golden_path.yaml` | Open lesson → culture → flashcards → quiz → complete | lesson-card-l1u1l1, btn-start-lesson, btn-next-card, btn-next-quiz, screen-lesson-complete |
| `03_ai_chat.yaml` | Open AI hub → Cafe scenario → send 2 messages | scenario-cafe, input-chat, btn-send |
| `04_profile.yaml` | Navigate to Profile tab | tab-profile |
| `05_leaderboard.yaml` | Navigate to Leaderboard tab | tab-ranking |

## Prerequisites

- A physical device or emulator running the app (`com.hanuri.app`)
- The device must be connected and listed in `maestro devices`
- For Android: `adb devices` should show the device
- For iOS: device must be paired via Xcode

## testID Reference

All testIDs added to the app for Maestro targeting:

### Auth / Onboarding
- `btn-start-free` — SplashScreen "Start for Free"
- `btn-google-login` — SplashScreen Google Login
- `lang-{code}` — Language selection (en, ko, es, zh, ja, vi)
- `btn-next-lang` — Language next button
- `goal-{code}` — Goal selection (kpop, travel, business, topik, relationship)
- `btn-next-goal` — Goal next button
- `level-{value}` — Level selection (1, 2, 3, 5)
- `btn-next-level` — Level next button
- `btn-start-app` — Notification "Start App" button
- `btn-skip-notif` — Notification skip button

### Navigation
- `tab-home` — Home tab
- `tab-lessons` — Lessons tab
- `tab-ai-chat` — AI Chat tab
- `tab-ranking` — Leaderboard tab
- `tab-profile` — Profile tab

### Lessons
- `lesson-card-{lessonId}` — Lesson card (e.g. `lesson-card-l1u1l1`)
- `btn-start-lesson` — Start lesson button
- `btn-next-card` — Next flashcard button
- `btn-next-quiz` — Submit quiz answer button
- `screen-lesson-complete` — Lesson complete screen root

### AI Chat
- `scenario-{id}` — Scenario card (e.g. `scenario-cafe`)
- `input-chat` — Chat text input
- `btn-send` — Send message button
