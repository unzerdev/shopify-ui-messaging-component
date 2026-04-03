/**
 * Infrastructure Error Classes
 * For errors related to external services, persistence, networking, etc.
 */
import { BaseError } from './base-error.js';

/**
 * Network Error - for HTTP and API communication issues
 */
export class NetworkError extends BaseError {
  public readonly statusCode?: number;
  public readonly url?: string;

  constructor(message: string, statusCode?: number, url?: string, details?: Record<string, unknown>) {
    super(message, 'NETWORK_ERROR', { statusCode, url, ...details });
    this.statusCode = statusCode;
    this.url = url;
  }

  static fromResponse(response: Response, details?: Record<string, unknown>): NetworkError {
    return new NetworkError(
      `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      response.url,
      details
    );
  }
}

/**
 * Repository Error - for data persistence issues
 */
export class RepositoryError extends BaseError {
  constructor(message: string, operation: string, details?: Record<string, unknown>) {
    super(message, 'REPOSITORY_ERROR', { operation, ...details });
  }
}

/**
 * External Service Error - for third-party API failures
 */
export class ExternalServiceError extends BaseError {
  public readonly service: string;
  public readonly statusCode?: number;

  constructor(
    service: string,
    message: string,
    statusCode?: number,
    details?: Record<string, unknown>
  ) {
    super(message, 'EXTERNAL_SERVICE_ERROR', { service, statusCode, ...details });
    this.service = service;
    this.statusCode = statusCode;
  }
}

/**
 * Timeout Error - for operation timeouts
 */
export class TimeoutError extends BaseError {
  public readonly timeoutMs: number;

  constructor(operation: string, timeoutMs: number, details?: Record<string, unknown>) {
    super(`Operation '${operation}' timed out after ${timeoutMs}ms`, 'TIMEOUT_ERROR', {
      operation,
      timeoutMs,
      ...details,
    });
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Serialization Error - for data format/parsing issues
 */
export class SerializationError extends BaseError {
  constructor(message: string, format: string, details?: Record<string, unknown>) {
    super(message, 'SERIALIZATION_ERROR', { format, ...details });
  }
}
