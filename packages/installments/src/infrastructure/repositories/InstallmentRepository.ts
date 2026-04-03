/**
 * Unzer Installment Repository Implementation
 * Handles API calls to Unzer service for installment plans
 */
import {
  GetInstallmentPlansResponse,
  InstallmentPlanDto,
} from '../../application/dto';
import { IInstallmentDataRepository } from '../../application/ports';
import { logger } from '@unzer/messaging-core';

export class InstallmentRepository implements IInstallmentDataRepository {
  constructor(private readonly apiUrl: string = 'https://api.unzer.com/v1') {}

  async getInstallmentPlans(
    amount: number,
    currency: string,
    country: string,
    customerType: string,
    publicKey: string
  ): Promise<GetInstallmentPlansResponse> {
    try {
      // Call Unzer API with GET and query parameters
      const params = new URLSearchParams({
        amount: amount.toString(),
        currency: currency,
        country: country,
        customerType: customerType,
      });

      const url = `${this.apiUrl}/types/paylater-installment/plans?${params.toString()}`;
      logger.info('Making API request', 'InstallmentRepository', { url });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(publicKey + ':')}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const err = new Error(`API request failed with status ${response.status}: ${response.statusText}`);
        (err as Error & { statusCode?: number }).statusCode = response.status;
        throw err;
      }

      const apiData = await response.json();

      // Debug: Log the actual API response structure
      logger.info('API Response received', 'InstallmentRepository', { 
        response: apiData, 
        responseType: typeof apiData, 
        responseKeys: Object.keys(apiData || {}) 
      });

      // Transform API response to our DTO format
      // Try different possible property names for plans array
      const rawPlans = apiData.installmentPlans || apiData.plans || apiData.data || apiData || [];
      logger.info('Processing plans data', 'InstallmentRepository', { 
        rawPlans, 
        plansLength: rawPlans instanceof Array ? rawPlans.length : 'Not an array' 
      });

      const plans: InstallmentPlanDto[] = (rawPlans instanceof Array ? rawPlans : []).map((plan: Record<string, unknown>) => ({
        numberOfRates: (plan.numberOfRates as number) || 0,
        totalAmount: (plan.totalAmount as string) || amount.toFixed(2),
        nominalInterestRate: (plan.nominalInterestRate as number) || 0,
        effectiveInterestRate: (plan.effectiveInterestRate as number) || 0,
        interestAmount: (plan.interestAmount as string) || '0.00',
        minimumInstallmentFee: (plan.minimumInstallmentFee as string) || '0.00',
        secciUrl: (plan.secciUrl as string) || '',
        installmentRates: ((plan.installmentRates as unknown[]) || []).map((rate: unknown) => ({
          date: ((rate as Record<string, unknown>).date as string) || '',
          rate: ((rate as Record<string, unknown>).rate as string) || '0.00',
        })),
        monthlyAmount: (plan.monthlyAmount as number) || 0,
        isInterestFree: (plan.isInterestFree as boolean) || false,
      }));

      return {
        plans: plans,
        totalPlans: plans.length,
        requestAmount: amount,
        requestCurrency: currency,
        success: true,
      };
    } catch (error) {
      logger.error('Installment API request failed', 'InstallmentRepository', { error });
      throw error;
    }
  }
}
