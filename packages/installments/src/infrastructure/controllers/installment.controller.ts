/**
 * Primary Adapter: Installment Controller
 * Handles installment-related operations for UI components
 */
import {
  BaseController,
  type ControllerResponse,
} from '@unzer/messaging-core';
import { GetInstallmentPlansUseCase } from '../../application/use-cases/installment/get-installment-plans.use-case.js';
import {
  GetInstallmentPlansRequest,
  GetInstallmentPlansResponse,
} from '../../application/dto';
import { Validator } from '../../application/validation';
import { GetInstallmentPlansSchema } from '../../application/validation';
import { InputValidationError } from '@unzer/messaging-core';
import { logger } from '@unzer/messaging-core';
import type { InstallmentErrorCode } from '../../types/installment-error-types.js';

export interface InstallmentControllerRequest {
  amount: number;
  currency: string;
  country: string;
  customerType: 'B2C' | 'B2B';
  publicKey: string;
}

interface CacheEntry {
  data: unknown;
  timestamp: number;
  isError?: boolean;
}

export class InstallmentController extends BaseController {
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static readonly ERROR_CACHE_DURATION = 30 * 1000; // 30 seconds for errors
  private static apiCache: Map<string, CacheEntry> = new Map();

  constructor(private getInstallmentPlansUseCase: GetInstallmentPlansUseCase) {
    super();
  }

  /**
   * Get installment plans for given parameters with caching
   */
  async getInstallmentPlans(
    request: InstallmentControllerRequest
  ): Promise<ControllerResponse<GetInstallmentPlansResponse>> {
    // Validate input
    const validationErrors = this.validateGetPlansRequest(request);
    if (validationErrors.length > 0) {
      logger.warn('Validation failed', 'InstallmentController', { errors: validationErrors });
      return { success: false, error: 'VALIDATION_ERROR' as InstallmentErrorCode, data: undefined };
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(request);
    const cachedResult = this.getFromCache(cacheKey);
    
    if (cachedResult) {
      return cachedResult;
    }

    // Cache miss - fetch from API
    const result = await this.fetchPlansFromAPI(request);
    
    // Cache the result (success or error)
    this.cacheResult(cacheKey, result);
    
    // Cleanup old cache entries
    this.cleanupOldCacheEntries();
    
    return result;
  }

  /**
   * Fetch plans from API without caching logic
   */
  private async fetchPlansFromAPI(
    request: InstallmentControllerRequest
  ): Promise<ControllerResponse<GetInstallmentPlansResponse>> {
    try {
      const applicationRequest: GetInstallmentPlansRequest = {
        amount: request.amount,
        currency: request.currency,
        country: request.country,
        customerType: request.customerType,
        publicKey: request.publicKey,
      };

      const response = await this.getInstallmentPlansUseCase.execute(applicationRequest);

      // Convert response with additional computed fields
      const convertedResponse: GetInstallmentPlansResponse = {
        plans: response.plans.map(plan => ({
          numberOfRates: plan.numberOfRates,
          totalAmount: plan.totalAmount,
          nominalInterestRate: plan.nominalInterestRate,
          effectiveInterestRate: plan.effectiveInterestRate,
          interestAmount: plan.interestAmount,
          minimumInstallmentFee: plan.minimumInstallmentFee,
          secciUrl: plan.secciUrl,
          installmentRates: plan.installmentRates,
          monthlyAmount: parseFloat(plan.totalAmount) / plan.numberOfRates,
          isInterestFree: plan.effectiveInterestRate === 0,
        })),
        totalPlans: response.plans.length,
        requestAmount: response.requestAmount,
        requestCurrency: response.requestCurrency,
        success: true,
        errors: response.errors,
      };

      return { success: true, data: convertedResponse };
    } catch (error) {
      const errorCode = this.classifyError(error);
      const technicalMessage = error instanceof Error ? error.message : String(error);
      logger.error('Plans fetch failed', 'InstallmentController', { code: errorCode, technical: technicalMessage });
      return { success: false, error: errorCode, data: undefined };
    }
  }

  /**
   * Classify an error into an InstallmentErrorCode for the UI layer
   */
  private classifyError(error: unknown): InstallmentErrorCode {
    if (error instanceof Error) {
      const statusCode = (error as Error & { statusCode?: number }).statusCode;
      if (statusCode) {
        if (statusCode === 401 || statusCode === 403) return 'AUTH_ERROR';
        if (statusCode === 400) return 'VALIDATION_ERROR';
        if (statusCode === 429) return 'RATE_LIMIT_ERROR';
        if (statusCode >= 500) return 'SERVER_ERROR';
      }
      // Network/fetch failures (TypeError: Failed to fetch, etc.)
      if (error instanceof TypeError || error.message.includes('fetch') || error.message.includes('network')) {
        return 'NETWORK_ERROR';
      }
      if (error.message.includes('Amount must be') || error.message.includes('amount')) {
        return 'AMOUNT_ERROR';
      }
    }
    return 'UNKNOWN_ERROR';
  }

  /**
   * Generate cache key from request parameters
   */
  private generateCacheKey(request: InstallmentControllerRequest): string {
    return `${request.publicKey}-${request.amount}-${request.currency}-${request.country}-${request.customerType}`;
  }

  /**
   * Get result from cache if available and not expired
   */
  private getFromCache(cacheKey: string): ControllerResponse<GetInstallmentPlansResponse> | null {
    const cached = InstallmentController.apiCache.get(cacheKey);
    if (!cached) {
      return null;
    }

    const now = Date.now();
    const cacheAge = now - cached.timestamp;
    
    // Check if cache is expired
    if (cached.isError) {
      if (cacheAge >= InstallmentController.ERROR_CACHE_DURATION) {
        InstallmentController.apiCache.delete(cacheKey);
        return null;
      }
      // Return cached error
      logger.debug('Using cached error', 'InstallmentController', { cacheAge, error: cached.data });
      return {
        success: false,
        error: cached.data as string,
        data: undefined,
      };
    } else {
      if (cacheAge >= InstallmentController.CACHE_DURATION) {
        InstallmentController.apiCache.delete(cacheKey);
        return null;
      }
      // Return cached success data
      logger.debug('Using cached data', 'InstallmentController', { cacheAge });
      return {
        success: true,
        data: cached.data as GetInstallmentPlansResponse,
        error: undefined,
      };
    }
  }

  /**
   * Cache the result (success or error)
   */
  private cacheResult(cacheKey: string, result: ControllerResponse<GetInstallmentPlansResponse>): void {
    const entry: CacheEntry = {
      data: result.success ? result.data : result.error,
      timestamp: Date.now(),
      isError: !result.success,
    };
    
    InstallmentController.apiCache.set(cacheKey, entry);
    logger.debug('Cached result', 'InstallmentController', { 
      cacheKey, 
      isError: entry.isError,
      dataSize: result.success ? result.data?.plans?.length : 0
    });
  }

  /**
   * Clean up old cache entries
   */
  private cleanupOldCacheEntries(): void {
    const now = Date.now();
    let deletedCount = 0;
    
    for (const [key, entry] of InstallmentController.apiCache.entries()) {
      const age = now - entry.timestamp;
      const maxAge = entry.isError ? InstallmentController.ERROR_CACHE_DURATION : InstallmentController.CACHE_DURATION;
      
      if (age > maxAge) {
        InstallmentController.apiCache.delete(key);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      logger.debug('Cleaned up cache entries', 'InstallmentController', { deletedCount });
    }
  }

  /**
   * Clear all cached data (useful when API credentials change)
   */
  public static clearCache(): void {
    const size = InstallmentController.apiCache.size;
    InstallmentController.apiCache.clear();
    logger.debug('Cleared all cache entries', 'InstallmentController', { clearedCount: size });
  }

  /**
   * Clear cache for specific key
   */
  public static clearCacheForKey(request: InstallmentControllerRequest): void {
    const cacheKey = `${request.publicKey}-${request.amount}-${request.currency}-${request.country}-${request.customerType}`;
    const deleted = InstallmentController.apiCache.delete(cacheKey);
    if (deleted) {
      logger.debug('Cleared cache for key', 'InstallmentController', { cacheKey });
    }
  }

  /**
   * Validate get plans request using validation schema
   */
  private validateGetPlansRequest(request: InstallmentControllerRequest): string[] {
    try {
      const result = Validator.validate(request, GetInstallmentPlansSchema);
      return result.allErrors;
    } catch (error) {
      if (error instanceof InputValidationError) {
        return [error.message];
      }
      return ['Validation failed: ' + (error instanceof Error ? error.message : 'Unknown error')];
    }
  }

  /**
   * Get supported currencies (example additional method)
   */
  async getSupportedCurrencies(): Promise<ControllerResponse<string[]>> {
    return this.handleRequest(async () => {
      // This could come from a configuration or external service
      return ['EUR', 'USD', 'GBP', 'CHF'];
    });
  }

  /**
   * Get supported countries (example additional method)
   */
  async getSupportedCountries(): Promise<ControllerResponse<string[]>> {
    return this.handleRequest(async () => {
      // This could come from a configuration or external service
      return ['DE', 'AT', 'CH', 'NL', 'BE'];
    });
  }
}
