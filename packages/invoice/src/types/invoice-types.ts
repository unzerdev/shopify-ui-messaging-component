/**
 * Invoice Widget Type Definitions
 */

export const LAYOUT_OPTIONS = ['buy-now', 'receive'] as const;
export const LOGO_VARIANT_OPTIONS = ['unzer-logo', 'icon', 'pm-logo', ''] as const;
export const LOGO_POSITION_OPTIONS = ['left', 'right'] as const;
export const INFO_BUTTON_LAYOUT_OPTIONS = ['icon', 'link'] as const;

export type InvoiceLayout = (typeof LAYOUT_OPTIONS)[number];
export type LogoVariant = (typeof LOGO_VARIANT_OPTIONS)[number];
export type LogoPosition = (typeof LOGO_POSITION_OPTIONS)[number];
export type InfoButtonLayout = (typeof INFO_BUTTON_LAYOUT_OPTIONS)[number];

/**
 * Unzer Invoice payment method configuration.
 * Passed via payment-method-config attribute.
 */
export interface UnzerInvoiceConfig {
  // Invoice-specific props (TBD from invoice spec)
}
