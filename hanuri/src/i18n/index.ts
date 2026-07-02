import { useAuthStore } from '../store/authStore';
import { translations, Translations } from './translations';
import { NativeLanguage } from '../types';

export { Translations };

export function useT(): Translations {
  const { user, onboardingData } = useAuthStore();
  const lang: NativeLanguage =
    user?.native_lang ??
    (onboardingData.nativeLanguage as NativeLanguage | undefined) ??
    'en';
  return translations[lang] ?? translations['en'];
}

/** 컴포넌트 밖(App.tsx 초기화 등)에서 현재 언어의 번역을 가져올 때 사용 — hook 아님 */
export function getT(): Translations {
  const { user, onboardingData } = useAuthStore.getState();
  const lang: NativeLanguage =
    user?.native_lang ??
    (onboardingData.nativeLanguage as NativeLanguage | undefined) ??
    'en';
  return translations[lang] ?? translations['en'];
}

/** Replaces {words} placeholder in a pron feedback string */
export function fillTemplate(template: string, words: string): string {
  return template.replace('{words}', words);
}
