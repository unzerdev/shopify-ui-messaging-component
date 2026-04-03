/**
 * CSS Variable Manager
 * Centralized manager for handling CSS variables across widgets
 */

import type { ConfigurationSchema, FieldSchema } from '../schema/types/schema-types.js';
import type { ConfigObject } from '../types/common-types.js';
import type { ICSSVariableManager } from './interfaces/ICSSVariableManager.js';

export class CSSVariableManager implements ICSSVariableManager {
  constructor() {
    // Remove singleton pattern - instances are now managed by DI container
  }

  /**
   * Batch apply CSS variables for better performance
   */
  batchApply(variables: Record<string, string>, target: HTMLElement | Document = document): void {
    const element = target === document ? document.documentElement : (target as HTMLElement);

    Object.entries(variables).forEach(([key, value]) => {
      element.style.setProperty(key, value);
    });
  }

  /**
   * Remove CSS variables from target
   */
  cleanup(variableNames: string[], target: HTMLElement | Document = document): void {
    const element = target === document ? document.documentElement : (target as HTMLElement);

    variableNames.forEach(name => {
      element.style.removeProperty(name);
    });
  }

  /**
   * Generate CSS variables from schema configuration
   */
  generateFromSchema(
    schema: ConfigurationSchema,
    config: ConfigObject,
    transformer?: (key: string, value: unknown, field?: FieldSchema) => string
  ): Record<string, string> {
    const variables: Record<string, string> = {};

    schema.tabs.forEach(tab => {
      tab.sections?.forEach(section => {
        section.fields.forEach(field => {
          if (field.metadata?.cssVariable && config[field.key] !== undefined) {
            const value = config[field.key];

            // Use transformer if provided, otherwise use default transform
            variables[field.metadata.cssVariable] = transformer
              ? transformer(field.key, value, field)
              : this.defaultTransform(value, field);
          }
        });
      });
    });

    return variables;
  }

  /**
   * Default value transformation
   */
  private defaultTransform(value: unknown, field: FieldSchema): string {
    // Add unit if specified
    if (field.metadata?.cssUnit && typeof value === 'number') {
      return `${value}${field.metadata.cssUnit}`;
    }

    return String(value);
  }
}