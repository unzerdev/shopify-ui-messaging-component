/**
 * Abstract Widget Base Class
 * Provides common functionality and CSS variable management for all widgets
 */

import { TemplateResult } from 'lit';
import { IWidget, WidgetConfig } from '../IWidget.js';
import { ConfigurationSchema, FieldSchema } from '../schema/types/schema-types.js';
import { buildConfigFromSchema } from '../schema/schema-utils.js';
import { _di } from '../../infrastructure';
import type { IWidgetTableProvider } from '../interfaces';
import type { ICSSVariableManager as ICSSVariableManagerType } from '../managers/interfaces/ICSSVariableManager.js';
import { ICSSVariableManager } from '../../bootstrap.js';

export abstract class AbstractWidget implements IWidget {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly schema: ConfigurationSchema;

  private _cssManager?: ICSSVariableManagerType;

  protected get cssManager(): ICSSVariableManagerType {
    if (!this._cssManager) {
      this._cssManager = _di(ICSSVariableManager);
    }
    return this._cssManager;
  }

  get defaultConfig(): WidgetConfig {
    return buildConfigFromSchema(this.schema) as WidgetConfig;
  }

  /**
   * Hook for custom style value transformation
   * Widget can override this for custom logic
   */
  protected transformStyleValue(_fieldKey: string, value: unknown, field?: FieldSchema): string {
    // Default implementation - just add unit if needed and convert to string
    if (field?.metadata?.cssUnit) {
      const numericValue = typeof value === 'number' ? value : parseFloat(String(value));
      if (!isNaN(numericValue)) {
        return `${numericValue}${field.metadata.cssUnit}`;
      }
    }
    return String(value);
  }

  /**
   * Hook for style value validation
   * Widget can override this for custom validation
   */
  protected validateStyleValue(_fieldKey: string, value: unknown, _field?: FieldSchema): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  /**
   * Generates inline styles for host element from schema configuration
   * Includes CSS variables marked with 'host' or 'both' scope
   */
  generateDirectStyles(config: WidgetConfig): string {
    const styles: string[] = [];

    this.schema.tabs.forEach(tab => {
      tab.sections?.forEach(section => {
        section.fields.forEach(field => {
          const scope = field.metadata?.cssScope;

          if (
            (scope === 'host' || scope === 'both') &&
            field.metadata?.cssVariable &&
            config[field.key] !== undefined
          ) {
            const value = config[field.key];

            if (!this.validateStyleValue(field.key, value, field)) {
              return;
            }

            const transformedValue = this.transformStyleValue(field.key, value, field);
            styles.push(`${field.metadata.cssVariable}: ${transformedValue}`);
          }
        });
      });
    });

    return styles.join('; ');
  }

  /**
   * Applies global CSS variables to document root
   * Includes CSS variables marked with 'global' or 'both' scope
   */
  applyGlobalStyles(config: WidgetConfig): void {
    const variables: Record<string, string> = {};

    this.schema.tabs.forEach(tab => {
      tab.sections?.forEach(section => {
        section.fields.forEach(field => {
          const scope = field.metadata?.cssScope;

          if (
            (scope === 'global' || scope === 'both') &&
            field.metadata?.cssVariable &&
            config[field.key] !== undefined
          ) {
            const value = config[field.key];

            if (!this.validateStyleValue(field.key, value, field)) {
              return;
            }

            variables[field.metadata.cssVariable] = this.transformStyleValue(
              field.key,
              value,
              field
            );
          }
        });
      });
    });

    // Batch apply for better performance
    this.cssManager.batchApply(variables);
  }

  // Abstract methods that widgets must implement
  abstract renderPreview(config: WidgetConfig): TemplateResult;
  abstract renderConfiguration(config: WidgetConfig): TemplateResult;

  // Optional methods with default implementation
  generateCode?(_config: WidgetConfig): string {
    return '<!-- Generated code -->';
  }

  getTableProvider?(): IWidgetTableProvider<unknown> | undefined {
    return undefined;
  }

  /**
   * Get default value for a field from the schema
   */
  protected getFieldDefault(fieldKey: string): unknown {
    for (const tab of this.schema.tabs) {
      for (const section of tab.sections ?? []) {
        for (const field of section.fields) {
          if (field.key === fieldKey) {
            return field.defaultValue;
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Handle element card click/drop operations for drag-option fields.
   * Generic implementation using fieldKey for routing and schema defaults for deselection.
   * Widgets can override for custom logic.
   */
  handleElementCardClick?(
    option: string | boolean,
    config: WidgetConfig,
    updateCallback: (updates: Partial<WidgetConfig>) => void,
    fieldKey?: string
  ): void {
    if (!fieldKey) return;

    // Boolean toggle
    if (option === true || option === 'true') {
      updateCallback({ [fieldKey]: !config[fieldKey] });
      return;
    }

    // Single-select drag-option: toggle or set
    const currentValue = config[fieldKey];
    if (currentValue === option) {
      // Deselect: set to empty string (not default) so field is "off"
      updateCallback({ [fieldKey]: '' });
    } else {
      updateCallback({ [fieldKey]: option });
    }
  }
}