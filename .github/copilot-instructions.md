# GitHub Copilot Instructions — Hanuri Korean App

## CRITICAL: Rules (Always Apply)

### Rule 1 — Accuracy
Use ONLY information from the provided context (files, conversation).
If information is insufficient or uncertain, do NOT guess.
State "I don't have enough information to answer" instead of speculating.
Goal is accuracy, not creativity.

### Rule 2 — Coding Style
Strictly follow the existing coding style, folder structure, and library patterns of this project.
Do NOT introduce new libraries or technologies not already in use unless explicitly requested.
Before modifying any file, read and understand its current contents first.

### Rule 3 — Reasoning Before Code
Before performing any task, first describe the step-by-step logic using a reasoning block.
Only write final code after the reasoning is complete and sound.
If the reasoning is insufficient, do not generate a final answer.

---

## Project Overview

React Native + Expo SDK 54 + TypeScript Korean learning app.
Working directory: `hanuri/`

## Key Conventions

- Use `SafeAreaView` from `react-native-safe-area-context` — never from `react-native`
- All user-facing strings use `useT()` hook (custom i18n, 6 languages)
- Zustand stores: `authStore` (user/auth), `userStore` (xp/streak/progress)
- `ScrollView` that fills remaining space needs `style={{ flex: 1 }}`
- No React hook calls after conditional early returns

## File Locations

- Screens: `hanuri/src/screens/`
- Stores: `hanuri/src/store/`
- Data: `hanuri/src/data/lessons.ts`, `hanuri/src/data/scenarios.ts`
- Services: `hanuri/src/services/` (supabase, aiService, notificationService, tts)
- i18n: `hanuri/src/i18n/translations.ts`
- Navigation: `hanuri/src/navigation/`
- Types: `hanuri/src/types/`

## Features NOT Yet Implemented (do not suggest as if working)

- Real leaderboard data (currently hardcoded mock)
- Real payment processing (ProUpgrade simulates success)
- Apple Sign-In (shows Coming Soon)
- AI responses when API keys are empty (uses 5 rotating mock strings)
