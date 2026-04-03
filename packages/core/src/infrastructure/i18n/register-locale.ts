/**
 * Public API for registering custom locale translations
 */
import { _di } from '../container/index.js';
import { ILocaleService } from './locale-service.js';
import type { TranslationMap } from './types.js';

/**
 * Register or extend translations for a locale.
 * Merges with existing translations (does not replace).
 *
 * @example
 * ```typescript
 * registerLocale('es', {
 *   'installments.details.title': 'Pago a plazos',
 *   'invoice.banner.buyNow': 'Compra ahora, paga después',
 * });
 * ```
 */
export function registerLocale(locale: string, translations: TranslationMap): void {
  _di(ILocaleService).registerLocale(locale, translations);
}
