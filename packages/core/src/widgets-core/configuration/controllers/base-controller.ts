/**
 * Base Controller for Primary Adapters
 * Provides common functionality for all controllers
 */
import { ErrorHandler } from '../../../infrastructure/utils/error-handler.js';
import { logger } from '../../../infrastructure/logging/logger.js';
import { performanceMonitor } from '../../../infrastructure/monitoring/performance-monitor.js';
import type { ControllerResponse } from '../dto/index.js';

export type { ControllerResponse };

export abstract class BaseController {
  /**
   * Create successful response
   */
  protected success<T>(data: T): ControllerResponse<T> {
    return {
      success: true,
      data,
    };
  }

  /**
   * Create error response
   */
  protected error(message: string, errors?: string[]): ControllerResponse {
    return {
      success: false,
      error: message,
      errors,
    };
  }

  /**
   * Create error response from exception with full error info
   */
  protected errorFromException(error: unknown, context?: string): ControllerResponse {
    ErrorHandler.classify(error); // For error classification
    const userMessage = ErrorHandler.formatForUser(error);

    // Log error for debugging
    ErrorHandler.log(error, context);

    return {
      success: false,
      error: userMessage,
    };
  }

  /**
   * Handle async operations with error catching
   */
  protected async handleRequest<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<ControllerResponse<T>> {
    const operationName = context || 'controller-operation';

    return await performanceMonitor.time(
      operationName,
      async () => {
        try {
          logger.debug(`Starting operation: ${operationName}`);
          const result = await operation();
          logger.info(`Operation completed successfully: ${operationName}`);
          return this.success(result);
        } catch (error) {
          logger.error(`Operation failed: ${operationName}`, context, error);
          return this.errorFromException(error, context);
        }
      },
      'controller'
    ) as ControllerResponse<T>;
  }

  /**
   * Handle async operations with retry capability
   */
  protected async handleRequestWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    context?: string
  ): Promise<ControllerResponse<T>> {
    const operationName = context || 'controller-retry-operation';

    return await performanceMonitor.time(
      operationName,
      async () => {
        try {
          logger.debug(`Starting retry operation: ${operationName}`, context, { maxRetries });
          const result = await ErrorHandler.withRetry(operation, maxRetries);
          logger.info(`Retry operation completed: ${operationName}`);
          return this.success(result);
        } catch (error) {
          const errorInfo = ErrorHandler.classify(error);
          if (errorInfo.retryable) {
            logger.error(
              `Retry operation failed after ${maxRetries} attempts: ${operationName}`,
              context,
              error
            );
          } else {
            logger.error(`Operation failed (not retryable): ${operationName}`, context, error);
          }
          return this.errorFromException(error, context);
        }
      },
      'controller'
    ) as ControllerResponse<T>;
  }

  /**
   * Validate required fields
   */
  protected validateRequired(fields: Record<string, unknown>): string[] {
    const errors: string[] = [];

    for (const [fieldName, value] of Object.entries(fields)) {
      if (value === null || value === undefined || value === '') {
        errors.push(`${fieldName} is required`);
      }
    }

    return errors;
  }

  /**
   * Validate input and return errors if any
   */
  protected validateInput<T>(
    input: T,
    validator: (input: T) => string[]
  ): ControllerResponse<null> | null {
    const errors = validator(input);

    if (errors.length > 0) {
      return this.error('Validation failed', errors) as ControllerResponse<null>;
    }

    return null;
  }
}
