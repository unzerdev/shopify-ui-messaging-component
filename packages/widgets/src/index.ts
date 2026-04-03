/**
 * @unzer/messaging-widgets
 * Combined bundle: core + installments + invoice (no styler)
 * Self-contained — single script for integrators.
 */

// Core (auto-bootstraps)
export * from '@unzer/messaging-core';

// Installments widget
export * from '@unzer/messaging-installments';

// Invoice widget (namespaced re-exports to avoid collisions)
export { InvoiceWidget } from '@unzer/messaging-invoice';
export { INVOICE_CONFIG_SCHEMA, INVOICE_DEFAULTS } from '@unzer/messaging-invoice';
export { UnzerInvoiceWidget, UnzerInvoiceBanner, UnzerInvoiceDetails, UnzerInvoiceInfoButton, UnzerInvoiceLogo } from '@unzer/messaging-invoice';
export type { InvoiceLayout, LogoVariant, LogoPosition, InfoButtonLayout } from '@unzer/messaging-invoice';
export { LAYOUT_OPTIONS as INVOICE_LAYOUT_OPTIONS, LOGO_VARIANT_OPTIONS, LOGO_POSITION_OPTIONS, INFO_BUTTON_LAYOUT_OPTIONS } from '@unzer/messaging-invoice';
