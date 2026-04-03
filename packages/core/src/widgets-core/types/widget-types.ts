/**
 * Generic Widget Types
 * Provides flexible typing for widget-specific configurations
 */

/**
 * Generic configuration that widgets can extend with their specific properties
 */
export interface WidgetSpecificConfig {
  [key: string]: unknown;
}

/**
 * Base interface for widget configuration managers
 */
export interface IWidgetConfigManager {
  /**
   * Get the default configuration for this widget
   */
  getDefaultConfig(): WidgetSpecificConfig;

  /**
   * Validate widget-specific configuration
   */
  validateConfig?(config: WidgetSpecificConfig): boolean;

  /**
   * Merge configurations
   */
  mergeConfigs?(base: WidgetSpecificConfig, updates: Partial<WidgetSpecificConfig>): WidgetSpecificConfig;
}

/**
 * Widget configuration with type safety
 */
export interface TypedWidgetConfig<T = WidgetSpecificConfig> {
  widgetType: string;
  config: T;
}