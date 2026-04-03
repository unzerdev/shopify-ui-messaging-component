/**
 * Installment Plan DTO
 */

export interface InstallmentPlanDto {
  numberOfRates: number;
  totalAmount: string;
  nominalInterestRate: number;
  effectiveInterestRate: number;
  interestAmount: string;
  minimumInstallmentFee: string;
  secciUrl: string;
  installmentRates: {
    date: string;
    rate: string;
  }[];
  monthlyAmount: number; // Calculated field
  isInterestFree: boolean; // Calculated field
}