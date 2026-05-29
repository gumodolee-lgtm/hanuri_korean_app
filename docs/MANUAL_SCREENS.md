# 스크린/컴포넌트 매뉴얼 (Hanuri)

## 폴더 구조
- `hanuri/src/screens/` — 각 화면 (Screen 단위)
- `hanuri/src/components/` — 재사용 가능한 UI 컴포넌트

## 규칙

### 필수 import
```tsx
// ✅ 올바름
import { SafeAreaView } from 'react-native-safe-area-context';

// ❌ 틀림 — 절대 이것 사용하지 마라
import { SafeAreaView } from 'react-native';
```

### Hook 규칙
- 조건문(if/return) **이전에** 모든 Hook을 호출해야 한다.
- 컴포넌트 최상단에서 Hook 호출 → 그 다음에 조건부 로직.

```tsx
// ✅ 올바름
const MyScreen = () => {
  const t = useT();
  const { user } = useAuthStore();

  if (!user) return <LoadingScreen />;

  return <View>...</View>;
};

// ❌ 틀림
const MyScreen = () => {
  const { user } = useAuthStore();
  if (!user) return <LoadingScreen />;

  const t = useT(); // Hook after conditional return!
  return <View>...</View>;
};
```

### ScrollView
- `ScrollView`가 남은 공간을 채워야 할 때: `style={{ flex: 1 }}` 필수

### 다국어 (i18n)
- 모든 사용자 대면 문자열은 `useT()` 훅을 통해 처리
- 하위 컴포넌트도 자체적으로 `useT()`를 호출 (props로 전달하지 않음)

## 안티패턴
- ❌ 하드코딩된 한국어/영어 문자열
- ❌ `react-native`에서 `SafeAreaView` import
- ❌ 조건부 return 뒤에 Hook 호출
- ❌ `ScrollView`에 `flex: 1` 없이 스크롤 안 되는 문제 방치
