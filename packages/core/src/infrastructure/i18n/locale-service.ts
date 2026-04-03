/**
 * Locale Service
 * Handles translation lookup and locale registration via DI
 */
import type { TranslationMap } from './types.js';
import type { InterfaceConstructor } from '../container/types.js';
import { en } from './locales/en.js';
import { de } from './locales/de.js';
import { fr } from './locales/fr.js';
import { nl } from './locales/nl.js';
import { es } from './locales/es.js';
import { it } from './locales/it.js';
import { no } from './locales/no.js';
import { pt } from './locales/pt.js';
import { sr } from './locales/sr.js';
import { el } from './locales/el.js';
import { ru } from './locales/ru.js';

export class LocaleService {
  private bundles = new Map<string, TranslationMap>();

  constructor() {
    this.bundles.set('en', en);
    this.bundles.set('de', de);
    this.bundles.set('fr', fr);
    this.bundles.set('nl', nl);
    this.bundles.set('es', es);
    this.bundles.set('it', it);
    this.bundles.set('no', no);
    this.bundles.set('pt', pt);
    this.bundles.set('sr', sr);
    this.bundles.set('el', el);
    this.bundles.set('ru', ru);
  }

  /** Register or extend a locale bundle (merge, not replace) */
  registerLocale(locale: string, translations: TranslationMap): void {
    const existing = this.bundles.get(locale) ?? {};
    this.bundles.set(locale, { ...existing, ...translations });
  }

  /** Check if a locale is available */
  hasLocale(locale: string): boolean {
    return this.bundles.has(locale);
  }

  /** Get available locale codes */
  getAvailableLocales(): string[] {
    return Array.from(this.bundles.keys());
  }

  /** Translate key. Fallback: requested locale → English → key itself */
  t(key: string, locale: string): string {
    return this.bundles.get(locale)?.[key]
        ?? this.bundles.get('en')?.[key]
        ?? key;
  }

  /** Translate with parameter interpolation: {param} → value */
  tParams(key: string, locale: string, params: Record<string, string | number>): string {
    let result = this.t(key, locale);
    for (const [param, value] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value));
    }
    return result;
  }
}

/** DI token for LocaleService */
export const ILocaleService = {} as InterfaceConstructor<LocaleService>;
