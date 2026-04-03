export const INSTALLMENT_ERROR_CODES = [
  'AUTH_ERROR',
  'NETWORK_ERROR',
  'SERVER_ERROR',
  'VALIDATION_ERROR',
  'NO_PLANS',
  'AMOUNT_ERROR',
  'RATE_LIMIT_ERROR',
  'UNKNOWN_ERROR',
] as const;

export type InstallmentErrorCode = (typeof INSTALLMENT_ERROR_CODES)[number];

export interface InstallmentError {
  code: InstallmentErrorCode;
  /** Technical message for logging only — not displayed to users */
  technicalMessage: string;
  /** HTTP status code when applicable */
  statusCode?: number;
}
