import { LitElement, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { logger } from '../../../infrastructure/logging/logger.js';
import type { ConfigObject } from '../../types/common-types.js';

/**
 * UnzerAutoWidget - Generic auto-rendering component
 *
 * Monitors DOM elements and automatically creates/updates widget instances
 * based on extracted data from target elements.
 *
 * @example
 * ```html
 * <unzer-auto-widget
 *   target-selector=".product-price"
 *   container-selector=".product-card"
 *   widget-tag="unzer-widet-name"
 *   extract-field="amount"
 *   widget-props='{"publicKey": "s-pub-123", "currency": "EUR"}'>
 * </unzer-auto-widget>
 * ```
 */
@customElement('unzer-auto-widget')
export class UnzerAutoWidget extends LitElement {
  // ==========================================
  // CONFIGURATION PROPERTIES
  // ==========================================

  /** CSS selector for elements to monitor for data extraction */
  @property({ type: String, attribute: 'target-selector' })
  targetSelector = '';

  /** CSS selector for containers where widgets should be rendered */
  @property({ type: String, attribute: 'container-selector' })
  containerSelector = '';

  /** HTML tag name of the widget to create */
  @property({ type: String, attribute: 'widget-tag' })
  widgetTag = '';

  /** Field name on the widget to populate with extracted data */
  @property({ type: String, attribute: 'extract-field' })
  extractField = 'value';

  /** Additional static properties to set on created widgets */
  @property({
    type: Object,
    attribute: 'widget-props',
    converter: {
      fromAttribute: (value: string | null): ConfigObject => {
        if (!value) return {};
        try {
          return JSON.parse(value);
        } catch {
          logger.warn('Invalid widget-props JSON', 'UnzerAutoWidget', { value });
          return {};
        }
      }
    }
  })
  widgetProps: ConfigObject = {};

  /** Debounce time in ms for processing DOM changes */
  @property({ type: Number })
  debounce = 300;

  /** Enable debug logging */
  @property({ type: Boolean, attribute: 'debug' })
  debug = false;

  // ==========================================
  // INTERNAL STATE
  // ==========================================

  /** Map of containers to their rendered widgets */
  private renderedWidgets = new Map<Element, HTMLElement>();

  /** MutationObserver instance */
  private observer?: MutationObserver;

  /** Debounce timer */
  private debounceTimer?: number;

  /** Track if we're currently processing to avoid recursion */
  private isProcessing = false;

  // ==========================================
  // LIFECYCLE METHODS
  // ==========================================

  connectedCallback() {
    super.connectedCallback();
    this.startObserving();
    this.processElements(); // Initial scan
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopObserving();
    this.cleanup();
  }

  updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    // If selectors change, restart observation
    if (
      changedProperties.has('targetSelector') ||
      changedProperties.has('containerSelector') ||
      changedProperties.has('widgetTag')
    ) {
      this.stopObserving();
      this.cleanup();
      this.startObserving();
      this.processElements();
    }
  }

  // No render - this is a non-visual component
  render() {
    return null;
  }

  // ==========================================
  // OBSERVATION METHODS
  // ==========================================

  private startObserving(): void {
    if (!this.targetSelector || !this.containerSelector || !this.widgetTag) {
      this.log('Missing required configuration', 'warn');
      return;
    }

    this.observer = new MutationObserver((mutations) => {
      this.handleMutations(mutations);
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['data-amount', 'data-value'] // Common data attributes
    });

    this.log('Started observing DOM');
  }

  private stopObserving(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
      this.log('Stopped observing DOM');
    }
  }

  private handleMutations(mutations: MutationRecord[]): void {
    // First pass - filter out widget-related mutations
    const relevantMutations = mutations.filter(mutation => {
      // Check if this mutation is from our widgets FIRST
      if (this.isMutationFromWidget(mutation)) {
        this.log('Skipping mutation from widget', 'debug', {
          type: mutation.type,
          target: (mutation.target as Element).tagName || mutation.target.nodeName,
          targetClass: (mutation.target as Element).className || ''
        });
        return false;
      }
      return true;
    });
    
    // Check if any remaining mutation affects our target elements  
    const shouldProcess = relevantMutations.some(mutation => {

      // Check if mutation affects target elements
      if (mutation.type === 'characterData') {
        const parent = mutation.target.parentElement;
        const matches = parent && parent.matches(this.targetSelector);
        if (matches) {
          this.log('Character data changed in target element', 'debug', {
            parent: parent?.tagName,
            text: mutation.target.textContent
          });
        }
        return matches;
      }

      // Check for added/removed nodes
      if (mutation.type === 'childList') {
        // Log what nodes are being added/removed for debugging
        const addedInfo = Array.from(mutation.addedNodes).map(node => {
          if (node instanceof Element) {
            return `${node.tagName}.${node.className || 'no-class'}#${node.id || 'no-id'}`;
          }
          return node.nodeName;
        });
        const removedInfo = Array.from(mutation.removedNodes).map(node => {
          if (node instanceof Element) {
            return `${node.tagName}.${node.className || 'no-class'}#${node.id || 'no-id'}`;
          }
          return node.nodeName;
        });
        
        // Skip mutations on document.body that are likely modal-related
        if (mutation.target === document.body) {
          // Check if any of the added/removed nodes are our containers or targets
          const hasRelevantNodes = Array.from(mutation.addedNodes).concat(Array.from(mutation.removedNodes))
            .some(node => {
              if (node instanceof Element) {
                return node.matches(this.containerSelector) || 
                       node.matches(this.targetSelector) ||
                       node.querySelector(this.containerSelector) ||
                       node.querySelector(this.targetSelector);
              }
              return false;
            });
          
          if (!hasRelevantNodes) {
            this.log('Skipping body mutation - no relevant selectors', 'debug', {
              addedNodes: addedInfo,
              removedNodes: removedInfo
            });
            return false;
          }
        }
        
        // Process if nodes were added/removed that might affect our selectors
        this.log('Child list mutation detected', 'debug', {
          addedNodes: mutation.addedNodes.length,
          removedNodes: mutation.removedNodes.length,
          target: (mutation.target as Element).tagName || mutation.target.nodeName,
          added: addedInfo,
          removed: removedInfo
        });
        return true;
      }

      // Check attribute changes on target elements
      if (mutation.type === 'attributes' && mutation.target instanceof Element) {
        const matches = mutation.target.matches(this.targetSelector);
        if (matches) {
          this.log('Attribute changed on target element', 'debug', {
            attributeName: mutation.attributeName,
            element: mutation.target.tagName
          });
        }
        return matches;
      }

      return false;
    });

    if (shouldProcess) {
      this.log('Processing mutations', 'debug', { 
        mutationCount: mutations.length,
        relevantCount: relevantMutations.length 
      });
      this.debounceProcessing();
    } else if (relevantMutations.length > 0) {
      this.log('No relevant mutations to process', 'debug', { 
        mutationCount: mutations.length,
        filteredCount: relevantMutations.length 
      });
    }
  }

  private isMutationFromWidget(mutation: MutationRecord): boolean {
    const target = mutation.target as Node;
    const autoWidgetId = this.getAutoWidgetId();
    
    // Check if mutation is inside any widget created by THIS auto-widget
    for (const widget of this.renderedWidgets.values()) {
      // Check if this widget was created by us
      const widgetAutoId = widget.getAttribute('data-auto-widget-id');
      if (widgetAutoId !== autoWidgetId) {
        continue; // Skip widgets not created by this auto-widget instance
      }
      
      // IGNORE ALL CHANGES INSIDE OUR WIDGETS - shadow DOM or light DOM
      if (widget === target || widget.contains(target)) {
        logger.info('Skipping mutation inside our widget', 'UnzerAutoWidget', {
          widgetTag: widget.tagName.toLowerCase(),
          mutationType: mutation.type,
          targetNode: (target as Element).tagName || target.nodeName,
          autoWidgetId: autoWidgetId
        });
        return true;
      }
      
      // Also check shadow DOM separately (in case target is shadowRoot itself)
      if (widget.shadowRoot) {
        const shadowRoot = widget.shadowRoot as ShadowRoot;
        if (shadowRoot === target || shadowRoot.contains(target)) {
          logger.info('Skipping shadow DOM mutation in our widget', 'UnzerAutoWidget', {
            widgetTag: widget.tagName.toLowerCase(),
            mutationType: mutation.type,
            autoWidgetId: autoWidgetId
          });
          return true;
        }
      }
    }
    
    // For childList mutations, check if we're adding/removing our widgets
    if (mutation.type === 'childList') {
      // Check if any added/removed node is marked as created by THIS auto-widget
      for (const node of [...Array.from(mutation.addedNodes), ...Array.from(mutation.removedNodes)]) {
        if (node instanceof Element) {
          // Skip if it's a widget we created
          if (node.getAttribute('data-auto-widget-id') === autoWidgetId) {
            logger.info('Skipping our widget add/remove mutation', 'UnzerAutoWidget', {
              element: node.tagName,
              action: Array.from(mutation.addedNodes).includes(node) ? 'added' : 'removed',
              autoWidgetId: autoWidgetId
            });
            return true;
          }
          
          // Generic check: Skip elements that look like widget-created overlays/modals
          // These typically have specific attributes or classes
          const isWidgetOverlay = 
            node.hasAttribute('role') && (node.getAttribute('role') === 'dialog' || node.getAttribute('role') === 'modal') ||
            node.classList.contains('modal') || 
            node.classList.contains('overlay') ||
            node.classList.contains('backdrop') ||
            (node.id && node.id.includes('modal')) ||
            (node.className && typeof node.className === 'string' && node.className.includes('modal'));
            
          if (isWidgetOverlay && mutation.target === document.body) {
            logger.debug('Skipping widget overlay/modal mutation', 'UnzerAutoWidget', {
              element: node.tagName,
              classes: node.className,
              role: node.getAttribute('role')
            });
            return true;
          }
        }
      }
    }

    return false;
  }

  private debounceProcessing(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(() => {
      this.processElements();
    }, this.debounce);
  }

  // ==========================================
  // PROCESSING METHODS
  // ==========================================

  private processElements(): void {
    if (this.isProcessing) {
      this.log(`SKIP: Already processing elements`, 'debug');
      return; // Avoid recursion
    }

    this.isProcessing = true;

    try {
      // Find all containers
      const containers = document.querySelectorAll(this.containerSelector);

      this.log(`Started processing ${containers.length} containers`, 'info');

      if (containers.length === 0) {
        this.log(`SKIP: No containers found for selector`, 'info', {
          containerSelector: this.containerSelector
        });
      }

      // Process each container
      containers.forEach((container, index) => {
        this.log(`Processing container ${index + 1}/${containers.length}`, 'debug', {
          containerInfo: this.getElementInfo(container)
        });
        this.processContainer(container);
      });

      // Clean up orphaned widgets
      this.cleanupOrphaned();

      this.log(`Finished processing ${containers.length} containers`, 'info');

    } finally {
      this.isProcessing = false;
    }
  }

  private processContainer(container: Element): void {
    const containerInfo = this.getElementInfo(container);
    
    // Find target element within or near the container
    const target = this.findTargetElement(container);

    if (!target) {
      // No target found - remove widget if exists
      this.log(`SKIP: No target element found in container`, 'info', { 
        containerInfo,
        targetSelector: this.targetSelector 
      });
      this.removeWidget(container);
      return;
    }

    const targetInfo = this.getElementInfo(target);

    // Extract data from target
    const extractedValue = this.extractData(target);

    if (extractedValue === null || extractedValue === undefined) {
      this.log(`SKIP: No data extracted from target element`, 'info', { 
        containerInfo,
        targetInfo,
        extractField: this.extractField,
        targetText: target.textContent?.trim() || ''
      });
      this.removeWidget(container);
      return;
    }

    this.log(`Processing container with extracted value`, 'info', {
      containerInfo,
      targetInfo,
      extractedValue,
      extractField: this.extractField
    });

    // Create or update widget
    this.ensureWidget(container, extractedValue);
  }

  private findTargetElement(container: Element): Element | null {
    // First check within container
    let target = container.querySelector(this.targetSelector);

    // If not found, check if container itself matches
    if (!target && container.matches(this.targetSelector)) {
      target = container;
    }

    // If still not found, check siblings
    if (!target && container.parentElement) {
      target = container.parentElement.querySelector(this.targetSelector);
    }

    return target;
  }

  private extractData(element: Element): unknown {
    // Try data attribute first
    const dataAttr = element.getAttribute(`data-${this.extractField}`);
    if (dataAttr) {
      return this.parseValue(dataAttr);
    }

    // Try text content
    const text = element.textContent?.trim() || '';

    // Extract numbers from text (for amounts, prices, etc.)
    if (this.extractField === 'amount' || this.extractField === 'value') {
      const match = text.match(/[\d,]+\.?\d*/);
      if (match) {
        return parseFloat(match[0].replace(/,/g, ''));
      }
    }

    // Return raw text for other fields
    return text || null;
  }

  private parseValue(value: string): unknown {
    // Try to parse as number
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return num;
    }

    // Try to parse as JSON
    try {
      return JSON.parse(value);
    } catch {
      // Return as string
      return value;
    }
  }

  // ==========================================
  // WIDGET MANAGEMENT
  // ==========================================

  private ensureWidget(container: Element, value: unknown): void {
    const containerInfo = this.getElementInfo(container);
    let widget = this.renderedWidgets.get(container);

    if (!widget || !widget.isConnected) {
      // Create new widget (REPLACE strategy)
      widget = this.createWidget(value);

      // Remove any existing widget in container (that wasn't created by us)
      const existing = container.querySelector(this.widgetTag);
      if (existing && existing !== widget) {
        this.log(`Removing existing widget to replace`, 'info', {
          containerInfo,
          existingWidget: this.getElementInfo(existing),
          reason: 'REPLACE strategy'
        });
        existing.remove();
      }

      // Add new widget
      container.appendChild(widget);
      this.renderedWidgets.set(container, widget);

      this.log(`Created new widget in container`, 'info', { 
        containerInfo,
        widgetTag: this.widgetTag,
        value,
        extractField: this.extractField 
      });
    } else {
      // Update existing widget only if value changed
      const currentValue = (widget as unknown as Record<string, unknown>)[this.extractField];
      if (currentValue !== value) {
        this.updateWidget(widget, value);
        this.log(`Updated existing widget value`, 'info', { 
          containerInfo,
          oldValue: currentValue,
          newValue: value,
          extractField: this.extractField 
        });
      } else {
        this.log(`SKIP: Widget value unchanged`, 'info', {
          containerInfo,
          currentValue,
          extractField: this.extractField,
          reason: 'Value already set'
        });
      }
    }
  }

  private createWidget(value: unknown): HTMLElement {
    const widget = document.createElement(this.widgetTag);

    // Set static props
    Object.entries(this.widgetProps).forEach(([key, val]) => {
      this.setPropertyOrAttribute(widget, key, val);
    });

    // Set extracted value
    (widget as unknown as Record<string, unknown>)[this.extractField] = value;

    // Mark as auto-rendered with a unique ID for this auto-widget instance
    widget.setAttribute('data-auto-rendered', 'true');
    widget.setAttribute('data-auto-widget-id', this.getAutoWidgetId());

    return widget;
  }
  
  private getAutoWidgetId(): string {
    // Create a unique ID for this auto-widget instance
    if (!this._autoWidgetId) {
      this._autoWidgetId = `auto-widget-${Math.random().toString(36).substr(2, 9)}`;
    }
    return this._autoWidgetId;
  }
  
  private _autoWidgetId?: string;

  private setPropertyOrAttribute(element: HTMLElement, key: string, value: unknown): void {
    // Set as property directly - demos should use correct camelCase property names
    (element as unknown as Record<string, unknown>)[key] = value;
  }

  private updateWidget(widget: HTMLElement, value: unknown): void {
    // Update the extracted field (already checked for changes in ensureWidget)
    (widget as unknown as Record<string, unknown>)[this.extractField] = value;
  }

  private removeWidget(container: Element): void {
    const widget = this.renderedWidgets.get(container);

    if (widget) {
      const containerInfo = this.getElementInfo(container);
      const widgetInfo = this.getElementInfo(widget);
      
      widget.remove();
      this.renderedWidgets.delete(container);
      this.log(`Removed widget from container`, 'info', {
        containerInfo,
        widgetInfo,
        reason: 'No valid target or data found'
      });
    } else {
      this.log(`SKIP: No widget to remove from container`, 'debug', {
        containerInfo: this.getElementInfo(container)
      });
    }
  }

  // ==========================================
  // CLEANUP METHODS
  // ==========================================

  private cleanupOrphaned(): void {
    // Remove widgets that are no longer in DOM
    const orphaned: Element[] = [];

    this.renderedWidgets.forEach((widget, container) => {
      if (!document.contains(widget) || !document.contains(container)) {
        orphaned.push(container);
      }
    });

    orphaned.forEach(container => {
      this.renderedWidgets.delete(container);
      this.log(`Cleaned up orphaned widget`, 'debug');
    });
  }

  private cleanup(): void {
    // Remove all rendered widgets
    this.renderedWidgets.forEach(widget => {
      widget.remove();
    });
    this.renderedWidgets.clear();

    // Clear timers
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = undefined;
    }

    this.log('Cleaned up all widgets');
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  private getElementInfo(element: Element): { tag: string; classes: string; id: string; text: string } {
    return {
      tag: element.tagName.toLowerCase(),
      classes: element.className || '',
      id: element.id || '',
      text: (element.textContent?.trim() || '').substring(0, 50)
    };
  }

  private log(message: string, level: 'info' | 'warn' | 'error' | 'debug' = 'info', data?: Record<string, unknown>): void {
    if (!this.debug && level === 'debug') {
      return;
    }

    const logData = {
      targetSelector: this.targetSelector,
      containerSelector: this.containerSelector,
      widgetTag: this.widgetTag,
      ...data
    };

    switch (level) {
      case 'warn':
        logger.warn(message, 'UnzerAutoWidget', logData);
        break;
      case 'error':
        logger.error(message, 'UnzerAutoWidget', logData);
        break;
      default:
        logger.info(message, 'UnzerAutoWidget', logData);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-auto-widget': UnzerAutoWidget;
  }
}
