import { computed, ref } from 'vue';
import { translations, type Locale, type TranslationKey } from './translations';

const STORAGE_KEY = 'serial-nin-locale';

function isLocale(value: string | null): value is Locale {
  return value === 'bn' || value === 'en';
}

function resolveInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return 'bn';
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (isLocale(saved)) {
    return saved;
  }

  return 'bn';
}

const localeState = ref<Locale>(resolveInitialLocale());

function applyDocumentLanguage(locale: Locale) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', locale);
  }
}

applyDocumentLanguage(localeState.value);

export function setLocale(locale: Locale) {
  localeState.value = locale;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, locale);
  }
  applyDocumentLanguage(locale);
}

export function translate(key: TranslationKey, params?: Record<string, string | number>): string {
  const table = translations[localeState.value] ?? translations.bn;
  const fallback = translations.en[key] ?? key;
  const template = table[key] ?? fallback;

  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, token: string) => {
    const value = params[token];
    return value === undefined ? `{${token}}` : String(value);
  });
}

export function useI18n() {
  return {
    locale: computed(() => localeState.value),
    t: translate,
    setLocale,
  };
}
