/**
 * Generic style applier for applying styles to HTML elements
 * Replaces both StyleManager and StyleController with a configurable approach
 */

import { logger } from '../../infrastructure/logging/logger.js';

// Simple type definitions for StyleApplier
export type StyleValue = string | number | boolean | undefined;

export interface StyleMapping {
  readonly [propertyKey: string]: string;
}

export type StyleConverter<TConfig> = (config: TConfig) => Record<string, StyleValue>;

export interface StyleApplierConfig<TConfig = Record<string, unknown>> {
  readonly styleMapping: StyleMapping;
  readonly propertiesNeedingPx?: ReadonlySet<string>;
  readonly converter?: StyleConverter<TConfig>;
}

/**
 * Generic style applier that can work with any configuration type
 * @template TConfig - The type of configuration object this applier handles
 */
export class StyleApplier<TConfig = Record<string, unknown>> {
  private readonly host: HTMLElement;
  private readonly config: StyleApplierConfig<TConfig>;

  /**
   * Create a new StyleApplier instance
   * @param host - The HTML element to apply styles to
   * @param config - Configuration for style mapping and conversion
   */
  constructor(host: HTMLElement, config: StyleApplierConfig<TConfig>) {
    this.host = host;
    this.config = config;
  }

  /**
   * Apply styles from configuration to the host element
   * @param inputConfig - Configuration object to extract styles from
   */
  applyStyles(inputConfig: TConfig): void {
    try {
      // Convert config to style properties if converter exists
      const styleProperties: Record<string, StyleValue> = this.config.converter
        ? this.config.converter(inputConfig)
        : (inputConfig as unknown as Record<string, StyleValue>);

      // Apply each property to host element
      this.applyStyleProperties(styleProperties);
    } catch (error) {
      logger.error('Error applying styles', 'StyleApplier', error);
    }
  }

  /**
   * Apply style properties to host element
   * @param styleProperties - Style properties to apply
   */
  private applyStyleProperties(styleProperties: Record<string, StyleValue>): void {
    Object.entries(styleProperties).forEach(([key, value]) => {
      if (!this.isValidStyleValue(value) || !this.config.styleMapping[key]) {
        return;
      }

      const cssVariable = this.config.styleMapping[key];
      const processedValue = this.processStyleValue(key, value);

      // Apply CSS custom property to host element
      this.host.style.setProperty(cssVariable, processedValue);
    });
  }

  /**
   * Process style value, adding units where needed
   * @param propertyKey - The property key being processed
   * @param value - The raw value to process
   * @returns Processed value with proper units
   */
  private processStyleValue(propertyKey: string, value: StyleValue): string {
    const stringValue = String(value);

    // Skip if value already has a unit or property doesn't need px
    if (
      !this.config.propertiesNeedingPx?.has(propertyKey) ||
      this.hasUnit(stringValue)
    ) {
      return stringValue;
    }

    // Add 'px' unit for numeric values that need it
    return `${stringValue}px`;
  }

  /**
   * Check if a value already contains a unit
   * @param value - Value to check
   * @returns True if value already has a unit
   */
  private hasUnit(value: string): boolean {
    return /[a-zA-Z%]$/.test(value.trim());
  }

  /**
   * Check if style value is valid and should be applied
   * @param value - Value to validate
   * @returns True if value is valid
   */
  private isValidStyleValue(value: StyleValue): value is string | number {
    return (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    );
  }

  /**
   * Clear all managed CSS variables from the host element
   * Useful for cleanup when component is disconnected
   */
  clearStyles(): void {
    try {
      Object.values(this.config.styleMapping).forEach((cssVariable) => {
        this.host.style.removeProperty(cssVariable);
      });
    } catch (error) {
      logger.error('Error clearing styles', 'StyleApplier', error);
    }
  }

  /**
   * Update the style configuration
   * @param newConfig - New configuration to use
   */
  updateConfig(newConfig: Partial<StyleApplierConfig<TConfig>>): void {
    Object.assign(this.config, newConfig);
  }

  /**
   * Get current host element
   * @returns The HTML element styles are being applied to
   */
  getHost(): HTMLElement {
    return this.host;
  }
}