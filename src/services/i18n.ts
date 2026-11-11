import itTranslations from '../locales/it.json';
import ptTranslations from '../locales/pt.json';

export type SupportedLanguage = 'pt' | 'it';

type Listener = (lang: SupportedLanguage) => void;
const listeners: Set<Listener> = new Set();

// 1. Detecção automática de idioma do navegador/dispositivo
function detectInitialLanguage(): SupportedLanguage {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('verticam_lang');
    if (saved === 'pt' || saved === 'it') {
      return saved;
    }
  }

  if (typeof navigator !== 'undefined' && navigator.language) {
    const navLang = navigator.language.toLowerCase();
    if (navLang.startsWith('pt')) {
      return 'pt';
    }
    if (navLang.startsWith('it')) {
      return 'it';
    }
  }

  // Padrão Brasil para quem acessar em português
  return 'pt';
}

let activeLanguage: SupportedLanguage = detectInitialLanguage();

export function getLanguage(): SupportedLanguage {
  return activeLanguage;
}

export function setLanguage(lang: SupportedLanguage) {
  if (activeLanguage === lang) return;
  activeLanguage = lang;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('verticam_lang', lang);
    } catch {}
  }
  listeners.forEach((listener) => listener(lang));
}

export function subscribeLanguageChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Gestore i18n per VertiCam con supporto a lingue dinamiche ('pt' | 'it')
 * e sostituzione parametri {{param}}.
 */
export function t(keyPath: string, params?: Record<string, string | number>): string {
  const translations = activeLanguage === 'pt' ? ptTranslations : itTranslations;
  const keys = keyPath.split('.');
  let current: any = translations;

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      // Fallback para italiano se não achar em português
      current = null;
      break;
    }
  }

  if (typeof current !== 'string') {
    // Tenta no italiano caso chave falte
    let fallback: any = itTranslations;
    for (const k of keys) {
      if (fallback && typeof fallback === 'object' && k in fallback) {
        fallback = fallback[k];
      } else {
        fallback = null;
        break;
      }
    }
    current = typeof fallback === 'string' ? fallback : keyPath;
  }

  let result = current;
  if (params && typeof result === 'string') {
    for (const [pKey, pVal] of Object.entries(params)) {
      result = result.replace(new RegExp(`{{${pKey}}}`, 'g'), String(pVal));
    }
  }

  return result;
}

export default { t, getLanguage, setLanguage, subscribeLanguageChange };
