/**
 * Invoice Widget Default Values
 */
import type { LogoVariant, LogoPosition, InfoButtonLayout } from '../types/invoice-types.js';

export const INVOICE_DEFAULTS = {
  infoButtonLayout: 'icon' as InfoButtonLayout,
  unzerLogoDisplay: 'unzer-logo' as LogoVariant,
  logoPosition: 'right' as LogoPosition,
  unzerLogoPosition: 'right' as LogoPosition,
} as const;
