# Supabase/인증 매뉴얼 (Hanuri)

## 구조
- `hanuri/src/services/` — Supabase 클라이언트 및 서비스 함수
- `hanuri/src/store/` — auth 관련 store

## Supabase 연결 정보
```
URL: https://bcfkuracrtjvmeeaitgh.supabase.co
ANON_KEY: EXPO_PUBLIC_SUPABASE_ANON_KEY (환경변수)
```

## 규칙

### 인증
- 로그인: Supabase Auth 사용
- Apple Login: 현재 미구현 — "Coming Soon" alert만 표시
- 게스트 모드: `guest_` 접두사 ID로 로컬 전용 사용

### DB 접근
- 항상 Supabase 클라이언트를 통해 접근
- RLS (Row Level Security) 정책을 고려해야 함
- 쿼리 작성 시 N+1 문제 주의

### 에러 처리
- Supabase 호출은 항상 에러를 처리:
  ```tsx
  const { data, error } = await supabase.from('table').select();
  if (error) {
    // 에러 핸들링
    return;
  }
  ```
- 네트워크 오류 시 사용자에게 적절한 메시지 표시

### 환경변수 보안
- `EXPO_PUBLIC_*` 변수는 클라이언트에 노출됨
- **비밀 키(service_role key 등)는 절대 EXPO_PUBLIC_ 변수에 넣지 마라**
- 검증: `grep -rn "EXPO_PUBLIC_" --include="*.ts"`

## 미구현 기능 (Mock 상태)
- Leaderboard: 하드코딩된 mock data — Supabase 미연결
- ProUpgrade: 실제 결제 없음 — 시뮬레이션만
- AI Chat: API 키 비어있으면 mock 응답

## 안티패턴
- ❌ Supabase 에러를 무시하고 진행
- ❌ service_role 키를 클라이언트 코드에 사용
- ❌ mock 기능을 실제 작동하는 것처럼 설명
- ❌ RLS 정책 무시하고 쿼리 작성
