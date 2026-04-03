import type { ConfigObject, FieldValue } from '../types/common-types.js';
/**
 * Schema Renderer
 * Generic renderer for schema-based configuration
 */

import { html, TemplateResult } from 'lit';
import { logger } from '../../infrastructure/logging/logger.js';
import {
  ConfigurationSchema,
  TabSchema,
  SectionSchema,
  FieldSchema,
  ConfigChangeEvent,
  SchemaValidationResult,
  FieldCondition,
  IFieldRenderer,
  TranslateFn
} from './types/schema-types.js';
import { TextFieldRenderer } from './field-renderers/text-field.js';
import { ColorFieldRenderer } from './field-renderers/color-field.js';
import { RangeFieldRenderer } from './field-renderers/range-field.js';
import { SelectFieldRenderer } from './field-renderers/select-field.js';
import { CheckboxFieldRenderer } from './field-renderers/checkbox-field.js';
import { DragOptionRenderer } from './field-renderers/drag-option.js';

/**
 * Main schema renderer class
 */
export class SchemaRenderer {
  private fieldRenderers: Map<string, IFieldRenderer> = new Map();
  private _config: ConfigObject = {};
  private _schema?: ConfigurationSchema;
  private _t?: TranslateFn;

  /** Resolve a translation key */
  private r(key: string | undefined): string {
    if (!key) return '';
    return this._t ? this._t(key) : key;
  }

  constructor() {
    this.registerDefaultRenderers();
  }

  get config(): ConfigObject {
    return this._config;
  }

  get schema(): ConfigurationSchema | undefined {
    return this._schema;
  }

  /**
   * Register default field renderers
   */
  private registerDefaultRenderers() {
    const rangeRenderer = new RangeFieldRenderer();
    this.registerFieldRenderer('text', new TextFieldRenderer());
    this.registerFieldRenderer('color', new ColorFieldRenderer());
    this.registerFieldRenderer('range', rangeRenderer);
    this.registerFieldRenderer('number', rangeRenderer); // Also register for number type
    this.registerFieldRenderer('select', new SelectFieldRenderer());
    this.registerFieldRenderer('checkbox', new CheckboxFieldRenderer());
    this.registerFieldRenderer('toggle', new CheckboxFieldRenderer()); // Reuse checkbox for toggle
    this.registerFieldRenderer('drag-option', new DragOptionRenderer());
  }

  /**
   * Register a custom field renderer
   */
  registerFieldRenderer(type: string, renderer: IFieldRenderer) {
    this.fieldRenderers.set(type, renderer);
  }

  /**
   * Render the complete schema
   */
  renderFromSchema(
    schema: ConfigurationSchema,
    config: ConfigObject,
    onChange: (event: ConfigChangeEvent) => void,
    activeTab?: string,
    t?: TranslateFn
  ): TemplateResult {
    this._schema = schema;
    this._config = config;
    this._t = t;

    const visibleTabs = schema.tabs.filter(tab => 
      this.evaluateConditions(tab.conditions?.show, config)
    );

    const currentTab = activeTab || visibleTabs[0]?.id;

    // If only one tab, render content directly without tab container
    if (visibleTabs.length <= 1) {
      return html`
        <div class="schema-config">
          ${this.renderTabContent(
            visibleTabs[0],
            config,
            onChange
          )}
        </div>
      `;
    }

    // Multiple tabs - use tab container with slots
    const tabItems = visibleTabs.map(tab => ({
      id: tab.id,
      label: this.r(tab.labelKey),
      icon: tab.icon
    }));

    return html`
      <div class="schema-config">
        <unzer-tab-container
          .tabs=${tabItems}
          active-tab=${currentTab}
          @tab-change=${(e: CustomEvent) => this.handleTabChange(e.detail.activeTab, onChange)}
        >
          ${visibleTabs.map(tab => html`
            <div slot="${tab.id}">
              ${this.renderTabContent(tab, config, onChange)}
            </div>
          `)}
        </unzer-tab-container>
      </div>
    `;
  }


  /**
   * Render tab content
   */
  private renderTabContent(
    tab: TabSchema | undefined,
    config: ConfigObject,
    onChange: (event: ConfigChangeEvent) => void
  ): TemplateResult {
    if (!tab) return html``;

    return html`
      <div class="tab-content">
        ${tab.sections.map(section => 
          this.renderSection(section, config, onChange)
        )}
      </div>
    `;
  }

  /**
   * Render a section
   */
  private renderSection(
    section: SectionSchema,
    config: ConfigObject,
    onChange: (event: ConfigChangeEvent) => void
  ): TemplateResult {
    const layoutClass = `section-${section.layout || 'form'}`;

    return html`
      <div class="section ${layoutClass}">
        ${section.titleKey ? html`
          <h3 class="section-title">${this.r(section.titleKey)}</h3>
        ` : ''}
        ${section.descriptionKey ? html`
          <p class="section-description">${this.r(section.descriptionKey)}</p>
        ` : ''}
        <div class="section-fields">
          ${section.fields.map(field => 
            this.renderField(field, config[field.key], config, onChange)
          )}
        </div>
      </div>
    `;
  }

  /**
   * Render a single field
   */
  renderField(
    field: FieldSchema,
    value: FieldValue,
    config: ConfigObject,
    onChange: (event: ConfigChangeEvent) => void
  ): TemplateResult {
    // Check visibility conditions
    if (!this.evaluateConditions(field.conditions?.show, config)) {
      return html``;
    }

    const isDisabled = !this.evaluateConditions(field.conditions?.enable, config);
    const currentValue = value ?? field.defaultValue;
    
    const renderer = this.fieldRenderers.get(field.type);
    if (!renderer) {
      logger.warn(`No renderer found for field type: ${field.type}`, 'SchemaRenderer');
      return html``;
    }

    const widthClass = field.metadata?.width ? `field-${field.metadata.width}` : 'field-full';

    return html`
      <div class="field-wrapper ${widthClass}">
        ${field.labelKey ? html`
          <label for="${field.key}" class="field-label">
            ${this.r(field.labelKey)}
            ${field.validation?.required ? html`<span class="required">*</span>` : ''}
          </label>
        ` : ''}
        ${renderer.render(
          field,
          currentValue,
          (newValue: FieldValue) => this.handleFieldChange(field, newValue, currentValue, onChange),
          isDisabled,
          this._t
        )}
        ${field.descriptionKey ? html`
          <span class="field-description">${this.r(field.descriptionKey)}</span>
        ` : ''}
        ${field.metadata?.hint ? html`
          <span class="field-hint">${field.metadata.hint}</span>
        ` : ''}
      </div>
    `;
  }

  /**
   * Handle field value change
   */
  private handleFieldChange(
    field: FieldSchema,
    value: FieldValue,
    oldValue: FieldValue,
    onChange: (event: ConfigChangeEvent) => void
  ) {
    // Validate the new value
    const validation = this.validateField(field, value);

    const event: ConfigChangeEvent = {
      field: field.key,
      value,
      oldValue,
      validation
    };

    onChange(event);
  }

  /**
   * Handle tab change
   */
  private handleTabChange(tabId: string, onChange: (event: ConfigChangeEvent) => void) {
    // Tab changes are handled by the parent component
    onChange({
      field: '__activeTab',
      value: tabId,
      oldValue: undefined
    });
  }

  /**
   * Validate a field value
   */
  private validateField(field: FieldSchema, value: FieldValue): { valid: boolean; message?: string } {
    if (!field.validation) {
      return { valid: true };
    }

    const validation = field.validation;

    // Required check
    if (validation.required && (value === undefined || value === null || value === '')) {
      return { valid: false, message: `${this.r(field.labelKey)} is required` };
    }

    // Number validations
    if (field.type === 'number' || field.type === 'range') {
      const numValue = Number(value);

      if (validation.min !== undefined && numValue < validation.min) {
        return { valid: false, message: `${this.r(field.labelKey)} must be at least ${validation.min}` };
      }

      if (validation.max !== undefined && numValue > validation.max) {
        return { valid: false, message: `${this.r(field.labelKey)} must be at most ${validation.max}` };
      }
    }

    // Pattern validation
    if (validation.pattern && typeof value === 'string') {
      if (!validation.pattern.test(value)) {
        return { valid: false, message: `${this.r(field.labelKey)} has invalid format` };
      }
    }

    // Custom validation
    if (validation.custom) {
      const result = validation.custom(value);
      if (typeof result === 'string') {
        return { valid: false, message: result };
      }
      if (!result) {
        return { valid: false, message: `${this.r(field.labelKey)} validation failed` };
      }
    }

    return { valid: true };
  }

  /**
   * Evaluate conditions
   */
  private evaluateConditions(
    conditions: FieldCondition[] | undefined,
    config: ConfigObject
  ): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    return conditions.every(condition => {
      const fieldValue = config[condition.field];
      const operator = condition.operator || 'equals';
      
      logger.info('Evaluating condition:', 'SchemaRenderer', {
        field: condition.field,
        fieldValue,
        operator,
        expectedValue: condition.value,
        result: operator === 'notEquals' ? fieldValue !== condition.value : fieldValue === condition.value
      });

      switch (operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'notEquals':
          return fieldValue !== condition.value;
        case 'contains':
          return String(fieldValue).includes(String(condition.value));
        case 'greaterThan':
          return Number(fieldValue) > Number(condition.value);
        case 'lessThan':
          return Number(fieldValue) < Number(condition.value);
        default:
          return false;
      }
    });
  }

  /**
   * Validate entire configuration
   */
  validateConfiguration(
    schema: ConfigurationSchema,
    config: ConfigObject
  ): SchemaValidationResult {
    const errors: Array<{ field: string; message: string }> = [];

    // Validate each field
    for (const tab of schema.tabs) {
      for (const section of tab.sections) {
        for (const field of section.fields) {
          const validation = this.validateField(field, config[field.key]);
          if (!validation.valid && validation.message) {
            errors.push({
              field: field.key,
              message: validation.message
            });
          }
        }
      }
    }

    // Global validation
    if (schema.validation?.global) {
      const result = schema.validation.global(config);
      if (typeof result === 'string') {
        errors.push({
          field: '__global',
          message: result
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}