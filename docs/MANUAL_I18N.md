# 다국어(i18n) 매뉴얼 (Hanuri)

## 구조
- `hanuri/src/i18n/` — 번역 파일 및 훅
- `useT()` — 커스텀 번역 훅

## 지원 언어 (6개)
| 코드 | 언어 |
|------|------|
| `en` | English |
| `ko` | 한국어 |
| `es` | Español |
| `zh` | 中文 |
| `ja` | 日本語 |
| `vi` | Tiếng Việt |

## 규칙

### 기본 사용법
```tsx
const MyComponent = () => {
  const t = useT();

  return <Text>{t('greeting')}</Text>;
};
```

### 하위 컴포넌트
- 각 컴포넌트가 **자체적으로** `useT()`를 호출
- props로 번역 함수를 전달하지 않음

```tsx
// ✅ 올바름 — 하위 컴포넌트가 직접 useT() 호출
const ChildComponent = () => {
  const t = useT();
  return <Text>{t('child_text')}</Text>;
};

// ❌ 틀림 — props로 전달
const ChildComponent = ({ t }) => {
  return <Text>{t('child_text')}</Text>;
};
```

### 새 문자열 추가 시
1. 모든 6개 언어 파일에 키를 추가
2. 하드코딩된 문자열 금지
3. 키 네이밍: `screen_name.element_description` 형태 권장

### TTS (Text-to-Speech)
- `expo-speech` 사용 (Korean)
- TTS용 텍스트도 번역된 문자열 사용

## 안티패턴
- ❌ 하드코딩된 사용자 대면 문자열
- ❌ 일부 언어 파일에만 키 추가 (6개 모두 필수)
- ❌ props로 `t` 함수 전달
- ❌ `useT()` 없이 직접 번역 객체 접근
