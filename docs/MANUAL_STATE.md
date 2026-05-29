# 상태관리 매뉴얼 (Hanuri — Zustand)

## 구조
- `hanuri/src/store/` — Zustand store 파일들
- 모든 store는 AsyncStorage를 통한 persistence 사용

## 규칙

### Store 함수 호출
- `addXP`, `addTodayMinutes` 등 store 함수를 호출할 때 **반드시 userId를 전달**
- 모든 호출 지점을 grep으로 확인:
  ```bash
  grep -rn "addXP\|addTodayMinutes\|updateProgress" --include="*.ts" --include="*.tsx"
  ```

### 게스트 사용자
- 게스트 user의 `id`는 `guest_` 접두사를 가짐
- 게스트 데이터는 로컬에만 저장 (Supabase 동기화 없음)
- 게스트 → 로그인 전환 시 로컬 데이터 보존/이전 경로를 고려해야 함

### 로그아웃 처리
- `signOut` 시 **모든 persist store**를 초기화해야 함
- `authStore`만 초기화하고 다른 store를 방치하면 데이터 유출 위험

### 달성 조건 (Streak, Badge 등)
- 반드시 **실제 학습 행위** (레슨 완료 등)를 기반으로 판정
- 화면 진입만으로 streak/badge가 달성되면 안 됨

## 안티패턴
- ❌ userId 없이 store 함수 호출
- ❌ 로그아웃 시 일부 store만 초기화
- ❌ 화면 진입만으로 달성 조건 충족
- ❌ 게스트 데이터를 Supabase에 동기화 시도
