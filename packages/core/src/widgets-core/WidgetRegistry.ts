import { IWidget } from './IWidget.js';
import { logger } from '../infrastructure/logging/logger.js';
import type { IWidgetRegistry } from './interfaces/IWidgetRegistry.js';

export class WidgetRegistry implements IWidgetRegistry {
  private widgets = new Map<string, IWidget>();

  constructor() {
    // Remove singleton pattern - instances are now managed by DI container
  }

  registerWidget(widget: IWidget): void {
    if (!widget.id || !widget.name) {
      throw new Error(`Invalid widget: ${widget.name || 'unknown'}`);
    }

    if (this.widgets.has(widget.id)) {
      logger.error(`Widget with ID '${widget.id}' already registered`, 'WidgetRegistry');
      return;
    }

    this.widgets.set(widget.id, widget);
  }

  getWidget(id: string): IWidget | null {
    return this.widgets.get(id) || null;
  }
  
  getAllWidgets(): IWidget[] {
    return Array.from(this.widgets.values());
  }

  hasWidget(id: string): boolean {
    return this.widgets.has(id);
  }

  unregisterWidget(id: string): boolean {
    return this.widgets.delete(id);
  }

  clear(): void {
    this.widgets.clear();
  }
}
