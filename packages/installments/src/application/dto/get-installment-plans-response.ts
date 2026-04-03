/**
 * Get Installment Plans Response DTO
 */
import { InstallmentPlanDto } from './installment-plan.js';

export interface GetInstallmentPlansResponse {
  plans: InstallmentPlanDto[];
  totalPlans: number;
  requestAmount: number;
  requestCurrency: string;
  success: boolean;
  errors?: string[];
}