/**
 * Application Error Classes for Widget System
 * For errors specific to application layer (use cases, application services)
 */
import { DomainError } from './domain-error.js';

/**
 * Use Case Error - for errors in use case execution
 */
export class UseCaseError extends DomainError {
  public readonly useCase: string;

  constructor(useCase: string, message: string, details?: Record<string, unknown>) {
    super(message, 'USE_CASE_ERROR', { useCase, ...details });
    this.useCase = useCase;
  }
}

/**
 * Input Validation Error - for invalid input data
 */
export class InputValidationError extends DomainError {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(message: string, field?: string, value?: unknown, details?: Record<string, unknown>) {
    super(message, 'INPUT_VALIDATION_ERROR', { field, value, ...details });
    this.field = field;
    this.value = value;
  }

  static fromValidationResults(errors: string[], field?: string): InputValidationError {
    const message =
      errors.length === 1 ? errors[0] : `Multiple validation errors: ${errors.join(', ')}`;

    return new InputValidationError(message, field, undefined, { errors });
  }
}

/**
 * Authorization Error - for access control violations
 */
export class AuthorizationError extends DomainError {
  public readonly resource: string;
  public readonly action: string;

  constructor(resource: string, action: string, details?: Record<string, unknown>) {
    super(`Access denied for action '${action}' on resource '${resource}'`, 'AUTHORIZATION_ERROR', {
      resource,
      action,
      ...details,
    });
    this.resource = resource;
    this.action = action;
  }
}

/**
 * Dependency Error - for dependency injection or service resolution issues
 */
export class DependencyError extends DomainError {
  public readonly dependency: string;

  constructor(dependency: string, message: string, details?: Record<string, unknown>) {
    super(message, 'DEPENDENCY_ERROR', { dependency, ...details });
    this.dependency = dependency;
  }
}