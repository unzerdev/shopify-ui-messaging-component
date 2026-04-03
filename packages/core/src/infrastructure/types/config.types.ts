/**
 * Base Configuration Types
 * Generic configuration interfaces that can be extended by higher layers
 */

/**
 * Base configuration object for form fields and components
 */
export interface BaseConfig {
  defaultValue?: unknown;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  [key: string]: unknown;
}