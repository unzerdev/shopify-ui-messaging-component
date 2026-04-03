/**
 * ICSSVariableManager Interface
 * Contract for CSS Variable management across widgets
 */

import type { ConfigurationSchema, FieldSchema } from '../../schema/types/schema-types.js';
import type { ConfigObject } from '../../types/common-types.js';

export interface ICSSVariableManager {
  /**
   * Batch apply CSS variables for better performance
   */
  batchApply(variables: Record<string, string>, target?: HTMLElement | Document): void;

  /**
   * Remove CSS variables from target
   */
  cleanup(variableNames: string[], target?: HTMLElement | Document): void;

  /**
   * Generate CSS variables from schema configuration
   */
  generateFromSchema(
    schema: ConfigurationSchema,
    config: ConfigObject,
    transformer?: (key: string, value: unknown, field?: FieldSchema) => string
  ): Record<string, string>;
}