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

/** Replaces {words} placeholder in a pron feedback string */
export function fillTemplate(template: string, words: string): string {
  return template.replace('{words}', words);
}
