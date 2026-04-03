import { TemplateResult } from 'lit';
import type { IWidgetTableProvider } from './interfaces';

/**
 * Base widget configuration interface defining common widget properties
 */
export interface WidgetConfig {
  [key: string]: unknown;
}

/**
 * Universal widget interface defining required capabilities for all widget implementations
 */
export interface IWidget {
  readonly id: string;
  readonly name: string;

  /**
   * Default configuration object containing initial widget settings
   */
  readonly defaultConfig: WidgetConfig;

  /**
   * Renders the live preview of the widget with applied configuration
   */
  renderPreview(config: WidgetConfig): TemplateResult;

  /**
   * Renders the configuration panel interface for widget customization
   */
  renderConfiguration(config: WidgetConfig): TemplateResult;

  /**
   * Generates HTML code string for widget integration (optional)
   */
  generateCode?(config: WidgetConfig): string;

  /**
   * Provides data table functionality for widget management (optional)
   */
  getTableProvider?(): IWidgetTableProvider<unknown> | undefined;

  /**
   * Apply global CSS variables for the widget (optional)
   * This allows widgets to set document-level CSS variables that work across shadow DOM boundaries
   */
  applyGlobalStyles?(config: WidgetConfig): void;

  /**
   * Handle element card click/drop operations for drag and drop functionality (optional)
   * This method handles widget-specific logic for toggling configuration options
   * 
   * @param option - The dragged/clicked option value (e.g., 'buttons', 'inline', etc.)
   * @param config - Current widget configuration
   * @param updateCallback - Callback function to apply configuration updates
   */
  handleElementCardClick?(
    option: string | boolean, 
    config: WidgetConfig, 
    updateCallback: (updates: Partial<WidgetConfig>) => void,
    fieldKey?: string
  ): void;
}
