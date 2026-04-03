/**
 * IWidgetRegistry Interface
 * Contract for widget registry functionality
 */

import type { IWidget } from '../IWidget.js';

export interface IWidgetRegistry {
  /**
   * Register a widget in the registry
   */
  registerWidget(widget: IWidget): void;

  /**
   * Get a widget by its ID
   */
  getWidget(id: string): IWidget | null;

  /**
   * Get all registered widgets
   */
  getAllWidgets(): IWidget[];

  /**
   * Check if a widget is registered
   */
  hasWidget(id: string): boolean;

  /**
   * Unregister a widget from the registry
   */
  unregisterWidget(id: string): boolean;

  /**
   * Clear all registered widgets
   */
  clear(): void;
}