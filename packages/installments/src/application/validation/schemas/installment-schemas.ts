/**
 * Installment-specific Validation Schemas
 */
import { ValidationSchema, CommonRules } from '../validation-schema.js';
import { CURRENCIES, COUNTRIES } from '../../../types/installment-types.js';

/**
 * Validation schema for installment plan requests
 */
export const GetInstallmentPlansSchema: ValidationSchema = {
  amount: {
    required: true,
    rules: [
      CommonRules.positive(),
      CommonRules.amount(),
      CommonRules.installmentAmount(),
    ],
  },
  currency: {
    required: true,
    rules: [
      CommonRules.currency(),
      {
        name: 'supportedCurrency',
        message: `Currency must be one of: ${CURRENCIES.join(', ')}`,
        validate: (value: unknown) => CURRENCIES.includes(value as (typeof CURRENCIES)[number]),
      },
    ],
  },
  country: {
    required: true,
    rules: [
      CommonRules.countryCode(),
      {
        name: 'supportedCountry',
        message: `Country must be one of: ${COUNTRIES.join(', ')}`,
        validate: (value: unknown) => COUNTRIES.includes(value as (typeof COUNTRIES)[number]),
      },
    ],
  },
  customerType: {
    required: true,
    rules: [CommonRules.customerType()],
  },
  publicKey: {
    required: false, // May be provided via configuration
    rules: [CommonRules.publicKey()],
  },
};

/**
 * Validation schema for installment plan entity
 */
export const InstallmentPlanSchema: ValidationSchema = {
  id: {
    required: true,
    rules: [CommonRules.minLength(1)],
  },
  numberOfRates: {
    required: true,
    rules: [
      CommonRules.positive(),
      CommonRules.integer(),
      CommonRules.min(3), // Minimum 3 installments
      CommonRules.maxInstallmentMonths(72), // Maximum 72 months
    ],
  },
  nominalInterestRate: {
    required: true,
    rules: [
      CommonRules.min(0),
      CommonRules.max(100), // Interest rate as percentage
    ],
  },
  effectiveInterestRate: {
    required: true,
    rules: [CommonRules.min(0), CommonRules.max(100)],
  },
  monthlyAmount: {
    required: true,
    rules: [CommonRules.positive(), CommonRules.amount()],
  },
  lastRate: {
    required: true,
    rules: [CommonRules.positive(), CommonRules.amount()],
  },
  totalAmount: {
    required: true,
    rules: [CommonRules.positive(), CommonRules.amount()],
  },
};
