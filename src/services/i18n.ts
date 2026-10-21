import itTranslations from '../locales/it.json';

type TranslationTree = typeof itTranslations;

/**
 * Gestore i18n per VolleyJump AI con supporto a chiavi annidate e sostituzione parametri {{param}}.
 */
export function t(keyPath: string, params?: Record<string, string | number>): string {
  const keys = keyPath.split('.');
  let current: any = itTranslations;

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return keyPath; // fallback alla chiave se non trovata
    }
  }

  if (typeof current !== 'string') {
    return keyPath;
  }

  let result = current;
  if (params) {
    for (const [pKey, pVal] of Object.entries(params)) {
      result = result.replace(new RegExp(`{{${pKey}}}`, 'g'), String(pVal));
    }
  }

  return result;
}

export default { t };
