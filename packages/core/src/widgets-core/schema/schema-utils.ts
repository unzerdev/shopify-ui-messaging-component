import type { ConfigObject, FieldValue } from '../types/common-types.js';
/**
 * Schema Utilities
 * Helper functions for working with configuration schemas
 */

import { ConfigurationSchema, FieldSchema } from './types/schema-types.js';

/**
 * Build a complete configuration object from schema defaults
 * Iterates through all tabs, sections, and fields to extract defaultValues
 */
export function buildConfigFromSchema(schema: ConfigurationSchema): ConfigObject {
  const config: ConfigObject = {};
  
  // Iterate through all tabs
  schema.tabs.forEach(tab => {
    // Iterate through all sections in the tab
    tab.sections?.forEach(section => {
      // Extract default value from each field
      section.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          config[field.key] = field.defaultValue;
        }
      });
    });
  });
  
  return config;
}

/**
 * Get a specific field value from schema
 * Type-safe way to retrieve field defaults
 */
export function getFieldValue<T = FieldValue>(
  schema: ConfigurationSchema, 
  fieldKey: string
): T | undefined {
  for (const tab of schema.tabs) {
    for (const section of tab.sections || []) {
      const field = section.fields.find(f => f.key === fieldKey);
      if (field) {
        return field.defaultValue as T;
      }
    }
  }
  return undefined;
}

/**
 * Find a field definition in the schema
 * Returns the complete field schema object
 */
export function findFieldInSchema(
  schema: ConfigurationSchema,
  fieldKey: string
): FieldSchema | undefined {
  for (const tab of schema.tabs) {
    for (const section of tab.sections || []) {
      const field = section.fields.find(f => f.key === fieldKey);
      if (field) {
        return field;
      }
    }
  }
  return undefined;
}

/**
 * Convert schema configuration to CSS variables
 * Handles special cases like shadow, numeric values with px, etc.
 */
export function schemaConfigToCSS(
  schema: ConfigurationSchema,
  config: ConfigObject,
  prefix: string = '--unzer'
): Record<string, string> {
  const cssVariables: Record<string, string> = {};
  
  // Process all fields in schema
  schema.tabs.forEach(tab => {
    tab.sections?.forEach(section => {
      section.fields.forEach(field => {
        const value = config[field.key];
        
        if (value === undefined || value === null) return;
        
        const cssVarName = `${prefix}-${field.key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        
        // Special handling based on field type and metadata
        if (field.key === 'shadow' && field.metadata?.cssValue) {
          // Shadow: boolean to CSS value conversion
          cssVariables[cssVarName] = value ? field.metadata.cssValue : 'none';
        }
        else if (field.type === 'range' || field.type === 'number') {
          // Numeric values: add px suffix
          cssVariables[cssVarName] = `${value}px`;
        }
        else if (field.type === 'color') {
          // Colors: ensure proper format
          cssVariables[cssVarName] = String(value).startsWith('#') 
            ? String(value) 
            : `#${value}`;
        }
        else if (typeof value === 'boolean') {
          // Boolean: convert to string
          cssVariables[cssVarName] = value ? 'true' : 'false';
        }
        else {
          // Default: string conversion
          cssVariables[cssVarName] = String(value);
        }
      });
    });
  });
  
  return cssVariables;
}

/**
 * Get all style-related fields from schema
 * Identifies fields that should be treated as styling
 */
export function getStyleFields(schema: ConfigurationSchema): FieldSchema[] {
  const styleFields: FieldSchema[] = [];
  
  schema.tabs.forEach(tab => {
    // Check if tab is styling-related (by id)
    const isStyleTab = tab.id === 'styling' || 
                       tab.id === 'appearance';
    
    if (isStyleTab) {
      tab.sections?.forEach(section => {
        styleFields.push(...section.fields);
      });
    } else {
      // Also check individual fields for style metadata
      tab.sections?.forEach(section => {
        section.fields.forEach(field => {
          if (field.metadata?.isStyle) {
            styleFields.push(field);
          }
        });
      });
    }
  });
  
  return styleFields;
}

/**
 * Validate configuration against schema
 * Returns validation results for all fields
 */
export function validateConfig(
  schema: ConfigurationSchema,
  config: ConfigObject
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  let valid = true;
  
  schema.tabs.forEach(tab => {
    tab.sections?.forEach(section => {
      section.fields.forEach(field => {
        const value = config[field.key];
        
        // Check required fields
        if (field.validation?.required && (value === undefined || value === null || value === '')) {
          errors[field.key] = `${field.labelKey} is required`;
          valid = false;
        }
        
        // Check min/max for numbers
        if (field.type === 'number' || field.type === 'range') {
          const numValue = Number(value);
          if (!isNaN(numValue)) {
            if (field.validation?.min !== undefined && numValue < field.validation.min) {
              errors[field.key] = `${field.labelKey} must be at least ${field.validation.min}`;
              valid = false;
            }
            if (field.validation?.max !== undefined && numValue > field.validation.max) {
              errors[field.key] = `${field.labelKey} must be at most ${field.validation.max}`;
              valid = false;
            }
          }
        }
        
        // Check pattern for text fields
        if (field.validation?.pattern && typeof value === 'string') {
          if (!field.validation.pattern.test(value)) {
            errors[field.key] = `${field.labelKey} has invalid format`;
            valid = false;
          }
        }
        
        // Custom validation
        if (field.validation?.custom) {
          const customResult = field.validation.custom(value);
          if (typeof customResult === 'string') {
            errors[field.key] = customResult;
            valid = false;
          } else if (!customResult) {
            errors[field.key] = `${field.labelKey} is invalid`;
            valid = false;
          }
        }
      });
    });
  });
  
  return { valid, errors };
}

/**
 * Merge configuration with schema defaults
 * Ensures all required fields have values
 */
export function mergeWithDefaults(
  schema: ConfigurationSchema,
  partialConfig: Partial<ConfigObject>
): ConfigObject {
  const defaults = buildConfigFromSchema(schema);
  return { ...defaults, ...partialConfig };
}

/**
 * Extract configuration for specific tab
 * Useful for partial configuration handling
 */
export function getTabConfig(
  schema: ConfigurationSchema,
  config: ConfigObject,
  tabId: string
): ConfigObject {
  const tabConfig: ConfigObject = {};
  
  const tab = schema.tabs.find(t => t.id === tabId);
  if (!tab) return tabConfig;
  
  tab.sections?.forEach(section => {
    section.fields.forEach(field => {
      if (field.key in config) {
        tabConfig[field.key] = config[field.key];
      }
    });
  });
  
  return tabConfig;
}

/**
 * Check if a field is a style field
 * Based on metadata.isStyle flag
 */
export function isStyleField(field: FieldSchema): boolean {
  return field.metadata?.isStyle === true;
}

/**
 * Extract all style fields from schema with their default values
 * Returns only fields marked with metadata.isStyle = true
 */
export function extractStyleFields(schema: ConfigurationSchema): ConfigObject {
  const styleConfig: ConfigObject = {};
  
  schema.tabs.forEach(tab => {
    tab.sections?.forEach(section => {
      section.fields.forEach(field => {
        if (isStyleField(field) && field.defaultValue !== undefined) {
          styleConfig[field.key] = field.defaultValue;
        }
      });
    });
  });
  
  return styleConfig;
}

/**
 * Extract style values from config based on schema
 * Returns only values for fields marked as style fields
 */
export function extractStyleConfig(
  schema: ConfigurationSchema,
  config: ConfigObject
): ConfigObject {
  const styleConfig: ConfigObject = {};
  
  schema.tabs.forEach(tab => {
    tab.sections?.forEach(section => {
      section.fields.forEach(field => {
        if (isStyleField(field) && config[field.key] !== undefined) {
          styleConfig[field.key] = config[field.key];
        }
      });
    });
  });
  
  return styleConfig;
}