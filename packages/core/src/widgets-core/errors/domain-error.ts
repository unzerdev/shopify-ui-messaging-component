/**
 * Domain Error Classes for Widget System
 * All domain errors should extend the infrastructure BaseError
 */

import { BaseError } from '../../infrastructure/errors/base-error.js';

/**
 * Base Domain Error Class
 */
export abstract class DomainError extends BaseError {
  /**
   * Check if error is of a specific type
   */
  static is(error: unknown, errorClass: typeof DomainError): boolean {
    return error instanceof errorClass;
  }
}

/**
 * Validation Error - for business rule violations
 */
export class ValidationError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
  }
}

/**
 * Not Found Error - for when entities cannot be found
 */
export class NotFoundError extends DomainError {
  constructor(resource: string, identifier?: string | number) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;

    super(message, 'NOT_FOUND_ERROR', { resource, identifier });
  }
}

/**
 * Configuration Error - for configuration-related issues
 */
export class ConfigurationError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', details);
  }
}

/**
 * Business Logic Error - for domain-specific business rule violations
 */
export class BusinessLogicError extends DomainError {
  constructor(message: string, rule: string, details?: Record<string, unknown>) {
    super(message, 'BUSINESS_LOGIC_ERROR', { rule, ...details });
  }
}