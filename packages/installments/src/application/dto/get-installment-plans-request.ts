/**
 * Get Installment Plans Request DTO
 */

export interface GetInstallmentPlansRequest {
  amount: number;
  currency: string;
  country: string;
  customerType: 'B2C' | 'B2B';
  publicKey: string;
}