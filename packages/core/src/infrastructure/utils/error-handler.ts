/**
 * Error Handler Utilities
 * Provides centralized error handling and classification
 */
import { BaseError } from '../errors/base-error.js';
import { NetworkError, TimeoutError, SerializationError } from '../errors/infrastructure-error.js';
import { logger } from '../logging/logger.js';

export interface ErrorInfo {
  message: string;
  code: string;
  type: 'domain' | 'infrastructure' | 'application' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
  details?: Record<string, unknown>;
  originalError?: Error;
}

/**
 * Centralized Error Handler
 */
export class ErrorHandler {
  /**
   * Classify and transform any error into standardized ErrorInfo
   */
  static classify(error: unknown): ErrorInfo {
    // Handle BaseError and its subclasses
    if (error instanceof BaseError) {
      return {
        message: error.message,
        code: error.code,
        type: ErrorHandler.getErrorType(error),
        severity: ErrorHandler.getSeverity(error),
        retryable: ErrorHandler.isRetryable(error),
        details: error.details,
        originalError: error,
      };
    }

    // Handle standard JavaScript errors
    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'UNKNOWN_ERROR',
        type: 'unknown',
        severity: 'medium',
        retryable: false,
        originalError: error,
      };
    }

    // Handle unknown error types
    const message = typeof error === 'string' ? error : 'An unexpected error occurred';
    return {
      message,
      code: 'UNKNOWN_ERROR',
      type: 'unknown',
      severity: 'medium',
      retryable: false,
    };
  }

  /**
   * Determine error type based on error class
   */
  private static getErrorType(error: BaseError): 'domain' | 'infrastructure' | 'application' {
    if (
      error instanceof NetworkError ||
      error instanceof TimeoutError ||
      error instanceof SerializationError
    ) {
      return 'infrastructure';
    }

    // For now, all non-infrastructure errors are treated as domain errors
    // Application layer errors should be handled by widgets
    return 'domain';
  }

  /**
   * Determine severity level based on error type and code
   */
  private static getSeverity(error: BaseError): 'low' | 'medium' | 'high' | 'critical' {
    switch (error.code) {
      case 'VALIDATION_ERROR':
      case 'INPUT_VALIDATION_ERROR':
        return 'low';

      case 'NOT_FOUND_ERROR':
      case 'AUTHORIZATION_ERROR':
        return 'medium';

      case 'BUSINESS_LOGIC_ERROR':
      case 'USE_CASE_ERROR':
        return 'high';

      case 'NETWORK_ERROR':
      case 'REPOSITORY_ERROR':
      case 'EXTERNAL_SERVICE_ERROR':
      case 'TIMEOUT_ERROR':
      case 'CONFIGURATION_ERROR':
      case 'DEPENDENCY_ERROR':
        return 'critical';

      default:
        return 'medium';
    }
  }

  /**
   * Determine if error is retryable
   */
  private static isRetryable(error: BaseError): boolean {
    switch (error.code) {
      case 'NETWORK_ERROR':
      case 'TIMEOUT_ERROR':
      case 'EXTERNAL_SERVICE_ERROR':
      case 'REPOSITORY_ERROR':
        return true;

      case 'VALIDATION_ERROR':
      case 'INPUT_VALIDATION_ERROR':
      case 'NOT_FOUND_ERROR':
      case 'AUTHORIZATION_ERROR':
      case 'BUSINESS_LOGIC_ERROR':
      case 'CONFIGURATION_ERROR':
        return false;

      default:
        return false;
    }
  }

  /**
   * Format error for user display
   */
  static formatForUser(error: unknown): string {
    const errorInfo = ErrorHandler.classify(error);

    switch (errorInfo.type) {
      case 'domain':
        return errorInfo.message; // Domain errors are typically user-friendly

      case 'application':
        if (errorInfo.code === 'INPUT_VALIDATION_ERROR') {
          return errorInfo.message; // Validation errors are user-friendly
        }
        return 'The operation could not be completed. Please try again.';

      case 'infrastructure':
        if (errorInfo.code === 'NETWORK_ERROR') {
          return 'Unable to connect to the service. Please check your internet connection and try again.';
        }
        if (errorInfo.code === 'TIMEOUT_ERROR') {
          return 'The operation timed out. Please try again.';
        }
        return 'A technical issue occurred. Please try again later.';

      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Log error with appropriate level
   */
  static log(error: unknown, context?: string): void {
    const errorInfo = ErrorHandler.classify(error);
    const logContext = context ? `[${context}] ` : '';
    const logMessage = `${logContext}${errorInfo.message}`;

    switch (errorInfo.severity) {
      case 'low':
        logger.warn(logMessage, context || 'ErrorHandler', errorInfo);
        break;
      case 'medium':
        logger.error(logMessage, context || 'ErrorHandler', errorInfo);
        break;
      case 'high':
      case 'critical':
        logger.error(logMessage, context || 'ErrorHandler', errorInfo);
        // In production, you might want to send these to a monitoring service
        break;
    }
  }

  /**
   * Create a retry wrapper for retryable operations
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const errorInfo = ErrorHandler.classify(error);

        // Don't retry if error is not retryable
        if (!errorInfo.retryable) {
          ErrorHandler.log(
            error,
            `Error not retryable (${errorInfo.code}), aborting after first attempt`
          );
          break;
        }

        if (attempt === maxRetries) {
          ErrorHandler.log(error, `Maximum retry attempts reached (${maxRetries})`);
          break;
        }

        // Wait before retrying (exponential backoff)
        const delay = delayMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));

        ErrorHandler.log(error, `Retry attempt ${attempt}/${maxRetries}`);
      }
    }

    throw lastError;
  }
}
