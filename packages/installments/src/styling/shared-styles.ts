import { cssText } from '@unzer/messaging-core';
import installmentVariablesContent from './installment-variables.css?inline';

/** Pre-parsed CSSResult for installment variables — import this instead of the raw CSS */
export const installmentVariablesStyles = cssText(installmentVariablesContent);
