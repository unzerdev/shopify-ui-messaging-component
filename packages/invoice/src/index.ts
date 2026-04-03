/**
 * @unzer/messaging-invoice
 * Invoice Messaging Widget
 */
import { bootstrapCore } from '@unzer/messaging-core';
import { registerInvoiceDependencies } from './infrastructure/di/invoice-di.js';

// Bootstrap core (idempotent) and register invoice widget
bootstrapCore();
registerInvoiceDependencies();

// Register top-level widget — child components are imported transitively
import './ui/components/banner/unzer-invoice-banner.js';

// Widget class
export { InvoiceWidget } from './InvoiceWidget.js';

// Configuration
export { INVOICE_CONFIG_SCHEMA } from './config/invoice-schema.js';
export { INVOICE_DEFAULTS } from './config/invoice-defaults.js';

// Types
export type { InvoiceLayout, LogoVariant, LogoPosition, InfoButtonLayout } from './types/invoice-types.js';
export { LAYOUT_OPTIONS, LOGO_VARIANT_OPTIONS, LOGO_POSITION_OPTIONS, INFO_BUTTON_LAYOUT_OPTIONS } from './types/invoice-types.js';

// UI Component classes
export { UnzerInvoiceWidget, UnzerInvoiceBanner } from './ui/components/banner/unzer-invoice-banner.js';
export { UnzerInvoiceDetails } from './ui/components/details/unzer-invoice-details.js';
export { UnzerInvoiceInfoButton } from './ui/components/info/unzer-invoice-info-button.js';
export { UnzerInvoiceLogo } from './ui/components/unzer-logo/unzer-invoice-logo.js';
