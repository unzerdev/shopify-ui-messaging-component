/**
 * Interface for installment data repository
 * Responsible for fetching installment plans from external APIs
 */
import { GetInstallmentPlansResponse } from '../dto/index.js';

export interface IInstallmentDataRepository {
  /**
   * Get installment plans from external API
   */
  getInstallmentPlans(
    amount: number,
    currency: string,
    country: string,
    customerType: string,
    publicKey: string
  ): Promise<GetInstallmentPlansResponse>;
}