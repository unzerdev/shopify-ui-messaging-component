/**
 * Validation Schema System
 * Provides declarative validation rules and validation logic
 */
import { CUSTOMER_TYPES } from '../../types/installment-types.js';

export type ValidationRule<T = unknown> = {
  name: string;
  message: string;
  validate: (value: T, context?: unknown) => boolean;
};

export type FieldValidation<T = unknown> = {
  required?: boolean;
  rules?: ValidationRule<T>[];
};

export type ValidationSchema = {
  [fieldName: string]: FieldValidation;
};

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  allErrors: string[];
}

/**
 * Common validation rules
 */
export const CommonRules = {
  // String validations
  minLength: (min: number): ValidationRule<unknown> => ({
    name: 'minLength',
    message: `Must be at least ${min} characters long`,
    validate: (value: unknown) => (value as string).length >= min,
  }),

  maxLength: (max: number): ValidationRule<unknown> => ({
    name: 'maxLength',
    message: `Must be no more than ${max} characters long`,
    validate: (value: unknown) => (value as string).length <= max,
  }),

  pattern: (regex: RegExp, message: string): ValidationRule<unknown> => ({
    name: 'pattern',
    message,
    validate: (value: unknown) => regex.test(value as string),
  }),

  email: (): ValidationRule<unknown> => ({
    name: 'email',
    message: 'Must be a valid email address',
    validate: (value: unknown) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string),
  }),

  // Number validations
  min: (minimum: number): ValidationRule<unknown> => ({
    name: 'min',
    message: `Must be at least ${minimum}`,
    validate: (value: unknown) => (value as number) >= minimum,
  }),

  max: (maximum: number): ValidationRule<unknown> => ({
    name: 'max',
    message: `Must be no more than ${maximum}`,
    validate: (value: unknown) => (value as number) <= maximum,
  }),

  positive: (): ValidationRule<unknown> => ({
    name: 'positive',
    message: 'Must be a positive number',
    validate: (value: unknown) => (value as number) > 0,
  }),

  integer: (): ValidationRule<unknown> => ({
    name: 'integer',
    message: 'Must be a whole number',
    validate: (value: unknown) => Number.isInteger(value as number),
  }),

  // Currency validations
  currency: (): ValidationRule<unknown> => ({
    name: 'currency',
    message: 'Must be a valid currency code (e.g., EUR, USD)',
    validate: (value: unknown) => /^[A-Z]{3}$/.test(value as string),
  }),

  amount: (): ValidationRule<unknown> => ({
    name: 'amount',
    message: 'Must be a valid monetary amount',
    validate: (value: unknown) => (value as number) > 0 && Number.isFinite(value as number) && (value as number) <= 999999.99,
  }),

  // Country and region validations
  countryCode: (): ValidationRule<unknown> => ({
    name: 'countryCode',
    message: 'Must be a valid country code (e.g., DE, AT, CH)',
    validate: (value: unknown) => /^[A-Z]{2}$/.test(value as string),
  }),

  // Business-specific validations
  customerType: (): ValidationRule<unknown> => ({
    name: 'customerType',
    message: `Must be one of: ${CUSTOMER_TYPES.join(', ')}`,
    validate: (value: unknown) => CUSTOMER_TYPES.includes(value as (typeof CUSTOMER_TYPES)[number]),
  }),

  publicKey: (): ValidationRule<unknown> => ({
    name: 'publicKey',
    message: 'Must be a valid public key format',
    validate: (value: unknown) => /^s-(pub|prv)-[a-zA-Z0-9]+$/.test(value as string),
  }),

  // Array validations
  arrayMinLength: (min: number): ValidationRule<unknown> => ({
    name: 'arrayMinLength',
    message: `Must contain at least ${min} items`,
    validate: (value: unknown) => value instanceof Array && value.length >= min,
  }),

  arrayMaxLength: (max: number): ValidationRule<unknown> => ({
    name: 'arrayMaxLength',
    message: `Must contain no more than ${max} items`,
    validate: (value: unknown) => value instanceof Array && value.length <= max,
  }),

  // Object validations
  hasProperty: (property: string): ValidationRule<unknown> => ({
    name: 'hasProperty',
    message: `Must have property '${property}'`,
    validate: (value: unknown) => Boolean(value && typeof value === 'object' && property in value),
  }),

  // Date validations
  dateAfter: (date: Date): ValidationRule<unknown> => ({
    name: 'dateAfter',
    message: `Must be after ${date.toISOString().split('T')[0]}`,
    validate: (value: unknown) => (value as Date) > date,
  }),

  dateBefore: (date: Date): ValidationRule<unknown> => ({
    name: 'dateBefore',
    message: `Must be before ${date.toISOString().split('T')[0]}`,
    validate: (value: unknown) => (value as Date) < date,
  }),

  // Custom validation for specific business rules
  installmentAmount: (minAmount: number = 0): ValidationRule<unknown> => ({
    name: 'installmentAmount',
    message: `Installment amount must be at least ${minAmount} EUR`,
    validate: (value: unknown) => (value as number) >= minAmount,
  }),

  maxInstallmentMonths: (maxMonths: number = 72): ValidationRule<unknown> => ({
    name: 'maxInstallmentMonths',
    message: `Maximum installment period is ${maxMonths} months`,
    validate: (value: unknown) => (value as number) <= maxMonths,
  }),
};

/**
 * Validation Engine
 */
export class Validator {
  /**
   * Validate a single value against a field validation
   */
  static validateField(value: unknown, fieldValidation: FieldValidation, fieldName: string): string[] {
    const errors: string[] = [];

    // Check if required
    if (fieldValidation.required && (value === null || value === undefined || value === '')) {
      errors.push(`${fieldName} is required`);
      return errors; // If required field is missing, don't run other validations
    }

    // Skip other validations if value is empty and not required
    if (!fieldValidation.required && (value === null || value === undefined || value === '')) {
      return errors;
    }

    // Run custom rules
    if (fieldValidation.rules) {
      for (const rule of fieldValidation.rules) {
        if (!rule.validate(value)) {
          errors.push(rule.message);
        }
      }
    }

    return errors;
  }

  /**
   * Validate an object against a validation schema
   */
  static validate(data: unknown, schema: ValidationSchema): ValidationResult {
    const errors: Record<string, string[]> = {};
    const allErrors: string[] = [];

    for (const [fieldName, fieldValidation] of Object.entries(schema)) {
      const fieldValue = (data as Record<string, unknown>)?.[fieldName];
      const fieldErrors = Validator.validateField(fieldValue, fieldValidation, fieldName);

      if (fieldErrors.length > 0) {
        errors[fieldName] = fieldErrors;
        allErrors.push(...fieldErrors);
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors,
      allErrors,
    };
  }

  /**
   * Create a validation function from a schema
   */
  static createValidator(schema: ValidationSchema) {
    return (data: unknown): ValidationResult => Validator.validate(data, schema);
  }

  /**
   * Combine multiple validation schemas
   */
  static mergeSchemas(...schemas: ValidationSchema[]): ValidationSchema {
    return schemas.reduce(
      (merged, schema) => ({
        ...merged,
        ...schema,
      }),
      {}
    );
  }
}
