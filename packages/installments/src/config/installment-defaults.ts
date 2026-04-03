/**
 * Installment Widget Specific Default Values
 * Contains defaults specific to the installment widget functionality
 */
import { 
  CUSTOMER_TYPES, 
  CURRENCIES, 
  COUNTRIES,
  CustomerType,
  Currency,
  Country
} from '../types/installment-types.js';

/**
 * Installment-specific defaults
 */
export const INSTALLMENT_DEFAULTS = {
  // Widget-specific defaults
  installmentLayout: 'buttons' as const,
  infoButtonLayout: 'icon' as const,
  unzerLogoDisplay: 'unzer-logo' as const,
  unzerLogoPosition: 'right' as const,

  // Amount configuration
  amount: {
    defaultValue: 50,
    min: 1,
    max: 10000,
    step: 1,
  },
  
  // Customer configuration
  currencies: CURRENCIES,
  countries: COUNTRIES,
  customerTypes: CUSTOMER_TYPES,
  defaultCurrency: 'EUR' as Currency,
  defaultCountry: 'DE' as Country,
  defaultCustomerType: 'B2C' as CustomerType,
} as const;

// Re-export types for convenience
export type {
  Currency,
  Country,
  CustomerType
} from '../types/installment-types.js';