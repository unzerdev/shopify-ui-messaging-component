import { cssText } from '@unzer/messaging-core';
import invoiceVariablesContent from './invoice-variables.css?inline';

/** Pre-parsed CSSResult for invoice variables — import this instead of the raw CSS */
export const invoiceVariablesStyles = cssText(invoiceVariablesContent);
