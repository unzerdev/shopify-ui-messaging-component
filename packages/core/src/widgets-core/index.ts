/**
 * Core Widget System Module
 * Provides reusable managers, observers, and core components for all widgets
 */

export * from './widget-registry.js';

// Managers and their types
export { 
  StyleApplier,
  type StyleValue,
  type StyleMapping,
  type StyleConverter,
  type StyleApplierConfig
} from './managers/style-applier.js';

// CSS Variable Manager
export { CSSVariableManager } from './managers/css-variable-manager.js';

// Abstract Widget Base Class
export { AbstractWidget } from './widgets/abstract-widget.js';

// Common types
export type {
  ConfigObject,
  ConfigValue,
  FieldValue,
  EventDetail,
  FactoryFunction,
  ConstructorArgs
} from './types/common-types.js';

// Configuration types
export type {
  SavedConfiguration,
  ConfigurationResponse,
  DeleteConfigurationResponse,
} from './types/configuration.js';

// Widget types
export type {
  WidgetSpecificConfig,
  IWidgetConfigManager,
  TypedWidgetConfig,
} from './types/widget-types.js';

// Device state type
export interface DeviceState {
  type: 'mobile' | 'tablet' | 'desktop';
  width: number;
  height: number;
  orientation?: 'portrait' | 'landscape';
  livePreviewDevice?: string;
  selectedMobileDevice?: string;
}

// Schema system exports
export type {
  ConfigurationSchema,
  FieldSchema,
  TabSchema,
  SectionSchema,
  FieldType,
  FieldValidation,
  FieldCondition,
  FieldOption,
  FieldMetadata,
  SectionLayout,
  ConfigChangeEvent,
  SchemaValidationResult,
  IFieldRenderer,
} from './schema/types/schema-types.js';
export { SchemaRenderer } from './schema/schema-renderer.js';
export { UnzerSchemaConfig } from './components/schema-config/unzer-schema-config.js';

// Schema utilities
export {
  buildConfigFromSchema,
  getFieldValue,
  findFieldInSchema,
  schemaConfigToCSS,
  getStyleFields,
  validateConfig,
  mergeWithDefaults,
  getTabConfig,
  isStyleField,
  extractStyleFields,
  extractStyleConfig
} from './schema/schema-utils.js';

// Export components
export * from './components';

// Export error classes
export * from './errors/domain-error.js';
export * from './errors/application-error.js';

// Configuration module
export * from './configuration/index.js';

// Messaging API helper
export * from './messaging/index.js';

