/**
 * Schema Types for Dynamic Configuration System
 * Defines the structure for widget configuration schemas
 */
import type { ConfigObject, FieldValue } from '../../types/common-types.js';

/**
 * Field types supported by the schema system
 */
export type FieldType = 
  | 'text' 
  | 'number' 
  | 'select' 
  | 'color' 
  | 'range' 
  | 'checkbox' 
  | 'toggle' 
  | 'drag-option'
  | 'custom';

/**
 * Validation rules for a field
 */
export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  pattern?: RegExp;
  custom?: (value: FieldValue) => boolean | string;
}

/**
 * Conditional display/enable rules
 */
export interface FieldCondition {
  field: string;
  operator?: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: FieldValue;
}

/**
 * Field metadata for enhanced UI
 */
export interface FieldMetadata {
  icon?: string;
  group?: string;
  placeholder?: string;
  hint?: string;
  width?: 'full' | 'half' | 'third' | 'quarter';
  cssValue?: string; // CSS value when field is enabled (for boolean fields)
  isStyle?: boolean; // Mark field as style-related
  multiple?: boolean; // Allow multiple selections
  
  // CSS Variable mapping for style fields
  cssVariable?: string; // CSS variable name (e.g., '--unzer-widgetName-primary-color')
  cssScope?: 'global' | 'host' | 'both'; // Where to apply CSS variable
  cssUnit?: string; // Unit to append to numeric values (e.g., 'px', '%', 'em')
}

/**
 * Option for select and drag-option fields
 */
export interface FieldOption {
  value: string | boolean;
  labelKey: string;
  icon?: string;
  disabled?: boolean;
}

/**
 * Schema for a single field
 */
export interface FieldSchema {
  key: string;
  type: FieldType;
  labelKey: string;
  descriptionKey?: string;
  defaultValue?: FieldValue;
  options?: FieldOption[];
  validation?: FieldValidation;
  conditions?: {
    show?: FieldCondition[];
    enable?: FieldCondition[];
  };
  metadata?: FieldMetadata;
  customRenderer?: string; // Component name for custom rendering
}

/**
 * Layout types for sections
 */
export type SectionLayout = 'form' | 'grid' | 'flex' | 'compact';

/**
 * Schema for a configuration section
 */
export interface SectionSchema {
  id: string;
  titleKey?: string;
  descriptionKey?: string;
  fields: FieldSchema[];
  layout?: SectionLayout;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

/**
 * Schema for a configuration tab
 */
export interface TabSchema {
  id: string;
  labelKey: string;
  icon?: string;
  sections: SectionSchema[];
  conditions?: {
    show?: FieldCondition[];
  };
}

/**
 * Complete configuration schema for a widget
 */
export interface ConfigurationSchema {
  version: string;
  widget: string;
  tabs: TabSchema[];
  validation?: {
    global?: (config: ConfigObject) => boolean | string;
  };
}

/**
 * Event detail for configuration changes
 */
export interface ConfigChangeEvent {
  field: string;
  value: FieldValue;
  oldValue?: FieldValue;
  validation?: {
    valid: boolean;
    message?: string;
  };
}

/**
 * Schema validation result
 */
export interface SchemaValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Translation function type for schema rendering
 */
export type TranslateFn = (key: string) => string;

/**
 * Field renderer interface
 */
export interface IFieldRenderer {
  canRender(field: FieldSchema): boolean;
  render(
    field: FieldSchema,
    value: FieldValue,
    onChange: (value: FieldValue) => void,
    disabled?: boolean,
    t?: TranslateFn
  ): unknown; // Returns lit-html TemplateResult
}