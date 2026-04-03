/**
 * Dev-only entry point
 * Imports all packages for demo pages during development
 */

// Core (must be first - sets up DI container)
import { bootstrapCore, setUnzerConfig } from '@unzer/messaging-core';

bootstrapCore();

// Widgets
import '@unzer/messaging-installments';
import '@unzer/messaging-invoice';

// Styler
import '@unzer/messaging-styler';

// Global config helper
interface UnzerComponentsGlobal {
  setConfig: (config: { publicKey?: string; apiUrl?: string; timeout?: number }) => void;
}

declare global {
  interface Window {
    UnzerComponents?: UnzerComponentsGlobal;
  }
}

if (typeof window !== 'undefined') {
  window.UnzerComponents = {
    setConfig: (config: { publicKey?: string; apiUrl?: string; timeout?: number }) => {
      setUnzerConfig(config);
    },
  };
}

// Re-export everything for dev convenience
export * from '@unzer/messaging-core';
export * from '@unzer/messaging-installments';
export { InvoiceWidget } from '@unzer/messaging-invoice';
export { INVOICE_CONFIG_SCHEMA, INVOICE_DEFAULTS } from '@unzer/messaging-invoice';
export { UnzerInvoiceWidget, UnzerInvoiceBanner, UnzerInvoiceDetails, UnzerInvoiceInfoButton, UnzerInvoiceLogo } from '@unzer/messaging-invoice';
export { UnzerStyler } from '@unzer/messaging-styler';
