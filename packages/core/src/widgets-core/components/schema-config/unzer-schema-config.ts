/**
 * Generic Schema-Based Configuration Component
 * Core component for rendering dynamic configurations from schemas
 */

import { html, CSSResultGroup, PropertyValues, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { UnzerElement } from '../../../infrastructure/ui/base/unzer-element.js';
import { cssText } from '../../../infrastructure/ui/utils/css-utils.js';
import type { ConfigurationSchema, ConfigChangeEvent } from '../../schema/types/schema-types.js';
import { SchemaRenderer } from '../../schema/schema-renderer.js';
import { buildConfigFromSchema } from '../../schema/schema-utils.js';
import '../../../infrastructure/ui/components/shared/tabs/unzer-tab-container.js';
import { logger } from '../../../infrastructure/logging/logger.js';

/**
 * Generic schema-based configuration component
 * Can be used by any widget to render its configuration UI
 */
@customElement('unzer-schema-config')
export class UnzerSchemaConfig extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cssText(`
        :host {
          display: block;
          width: 100%;
          height: auto;
          padding: 0;
          margin: 0;
        }
        
        .schema-config {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .tab-content {
          padding: 16px;
          flex: 1;
          overflow-y: auto;
        }
        
        /* Section styles */
        .section {
          margin-bottom: 24px;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--unzer-text-color, #1f2937);
        }
        
        .section-description {
          font-size: 14px;
          color: var(--unzer-text-secondary, #6b7280);
          margin-bottom: 16px;
        }
        
        .section-fields {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        /* Layout variations */
        .section-grid .section-fields {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }
        
        .section-flex .section-fields {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        
        .section-compact .section-fields {
          gap: 8px;
        }
        
        /* Field wrapper styles */
        .field-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .field-full { width: 100%; }
        .field-half { width: calc(50% - 6px); }
        .field-third { width: calc(33.333% - 8px); }
        .field-quarter { width: calc(25% - 9px); }
        
        .field-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--unzer-text-color, #1f2937);
        }
        
        .field-label .required {
          color: #ef4444;
          margin-left: 2px;
        }
        
        .field-description {
          font-size: 12px;
          color: var(--unzer-text-secondary, #6b7280);
          margin-top: 2px;
        }
        
        .field-hint {
          font-size: 11px;
          color: var(--unzer-text-muted, #9ca3af);
          font-style: italic;
        }
        
        /* Drag options grid */
        .drag-options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
        }
        
        .drag-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px 8px;
          border: 1px solid var(--unzer-border-color, #e5e7eb);
          border-radius: 8px;
          cursor: grab;
          transition: all 0.2s ease;
          background: var(--unzer-background-color, white);
          user-select: none;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          min-height: 70px;
          justify-content: center;
          gap: 6px;
        }
        
        .drag-option:hover {
          border-color: var(--unzer-primary-color, #d1d5db);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }
        
        .drag-option.active {
          border-color: var(--unzer-primary-color, #3b82f6);
          background: var(--unzer-primary-light, #f8faff);
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.15);
        }
        
        .drag-option[disabled] {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .drag-icon {
          margin-bottom: 6px;
          color: var(--unzer-icon-color, #6b7280);
          font-size: 16px;
        }
        
        .drag-option span {
          font-size: 12px;
          font-weight: 500;
          color: var(--unzer-text-color, #374151);
          text-align: center;
        }
        
        /* Checkbox and toggle styles */
        .checkbox-wrapper,
        .toggle-switch-wrapper {
          display: flex;
          align-items: center;
        }
        
        .checkbox {
          width: 16px;
          height: 16px;
        }
        
        .toggle-switch {
          position: relative;
          width: 44px;
          height: 24px;
          appearance: none;
          background: var(--unzer-toggle-bg, #e5e7eb);
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .toggle-switch:checked {
          background: var(--unzer-primary-color, #3b82f6);
        }
        
        .toggle-switch::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: transform 0.2s;
        }
        
        .toggle-switch:checked::after {
          transform: translateX(20px);
        }
        
        .toggle-switch:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        /* Validation styles */
        .field-wrapper.error .field-label {
          color: #ef4444;
        }
        
        .field-wrapper.error input,
        .field-wrapper.error select {
          border-color: #ef4444;
        }
        
        .validation-message {
          font-size: 12px;
          color: #ef4444;
          margin-top: 2px;
        }
      `)
    ];
  }

  /**
   * Configuration schema
   */
  @property({ type: Object })
  schema: ConfigurationSchema = {
    version: '1.0.0',
    widget: 'generic',
    tabs: []
  };

  /**
   * Current configuration values
   */
  @property({ type: Object })
  config: Record<string, unknown> = {};

  /**
   * Active tab
   */
  @state()
  private activeTab = '';

  /**
   * Validation errors
   */
  @state()
  private validationErrors: Map<string, string> = new Map();

  private schemaRenderer = new SchemaRenderer();
  private configInitialized = false;

  /**
   * Initialize configuration from schema defaults
   * Can be called by subclasses or automatically
   */
  protected initializeConfigFromSchema() {
    if (this.schema && this.schema.tabs.length > 0) {
      this.config = buildConfigFromSchema(this.schema);
      this.configInitialized = true;
    }
  }

  willUpdate(changedProperties: PropertyValues) {
    super.willUpdate(changedProperties);
    
    if (changedProperties.has('schema') && this.schema.tabs.length > 0) {
      // Set initial active tab if not set - in willUpdate to avoid update cycles
      if (!this.activeTab) {
        this.activeTab = this.schema.tabs[0].id;
      }
      
      // Auto-initialize config if not already done
      if (!this.configInitialized && Object.keys(this.config).length === 0) {
        this.initializeConfigFromSchema();
        this.configInitialized = true;
      }
    }
  }

  render(): TemplateResult {
    if (!this.schema || this.schema.tabs.length === 0) {
      return html`<div class="no-schema">No configuration schema provided</div>`;
    }

    return this.schemaRenderer.renderFromSchema(
      this.schema,
      this.config,
      (event: ConfigChangeEvent) => this.handleConfigChange(event),
      this.activeTab,
      this.t.bind(this)
    );
  }

  /**
   * Handle configuration changes
   */
  private handleConfigChange(event: ConfigChangeEvent) {
    // Handle special tab change event
    if (event.field === '__activeTab') {
      this.activeTab = event.value as string;
      this.requestUpdate();
      return;
    }

    // Validate the change
    if (event.validation && !event.validation.valid) {
      this.validationErrors.set(event.field, event.validation.message || 'Invalid value');
    } else {
      this.validationErrors.delete(event.field);
    }

    // Update configuration
    const newConfig = { ...this.config, [event.field]: event.value };
    
    // Special handling for certain fields
    if (this.shouldHandleSpecialCase(event.field, event.value)) {
      this.handleSpecialCase(event.field, event.value, newConfig);
    }

    this.config = newConfig;
    
    // Emit change event
    this.emit('config-change', {
      field: event.field,
      value: event.value,
      oldValue: event.oldValue,
      config: newConfig
    });

    logger.debug('Schema config change', 'UnzerSchemaConfig', {
      field: event.field,
      value: event.value,
      validation: event.validation
    });
  }

  /**
   * Check if field needs special handling
   */
  private shouldHandleSpecialCase(_field: string, _value: unknown): boolean {
    // Can be overridden in subclasses or configured via schema
    return false;
  }

  /**
   * Handle special cases for certain fields
   */
  private handleSpecialCase(_field: string, _value: unknown, _config: Record<string, unknown>) {
    // Can be overridden in subclasses or configured via schema
  }

  /**
   * Validate entire configuration
   */
  validateConfiguration(): boolean {
    const result = this.schemaRenderer.validateConfiguration(this.schema, this.config);
    
    // Update validation errors
    this.validationErrors.clear();
    result.errors.forEach(error => {
      this.validationErrors.set(error.field, error.message);
    });
    
    this.requestUpdate();
    return result.valid;
  }

  /**
   * Get current configuration
   */
  getConfiguration(): Record<string, unknown> {
    return { ...this.config };
  }

  /**
   * Set configuration
   */
  setConfiguration(config: Record<string, unknown>) {
    this.config = { ...config };
    this.requestUpdate();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-schema-config': UnzerSchemaConfig;
  }
}