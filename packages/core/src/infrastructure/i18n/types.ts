/**
 * i18n Type Definitions
 */

/** A flat map of translation key → translated string */
export type TranslationMap = Record<string, string>;

/** Centralized list of available locales — single source of truth for schemas and LocaleService */
export const LOCALE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'nl', label: 'Nederlands' },
  { value: 'es', label: 'Español' },
  { value: 'it', label: 'Italiano' },
  { value: 'no', label: 'Norsk' },
  { value: 'pt', label: 'Português' },
  { value: 'sr', label: 'Srpski' },
  { value: 'el', label: 'Ελληνικά' },
  { value: 'ru', label: 'Русский' },
] as const;
