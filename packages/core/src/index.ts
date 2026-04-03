/**
 * @unzer/messaging-core
 * Infrastructure, DI, i18n, shared UI components, schema system, and core widget types
 */

// Bootstrap — auto-run on import so DI is ready before any widget code
import { bootstrapCore } from './bootstrap.js';
bootstrapCore();

export { bootstrapCore, ICSSVariableManager, IWidgetRegistry, setUnzerConfig } from './bootstrap.js';

// Infrastructure exports
export * from './infrastructure/index.js';

// Logger (used by widgets directly)
export { logger } from './infrastructure/logging/logger.js';

// Core widget system exports
export * from './widgets-core/index.js';

// IWidget interface
export { type IWidget, type WidgetConfig } from './widgets-core/IWidget.js';

// Interfaces
export type { IWidgetRegistry as IWidgetRegistryType } from './widgets-core/interfaces/IWidgetRegistry.js';
export type { IWidgetTableProvider } from './widgets-core/interfaces/index.js';
export type { ICSSVariableManager as ICSSVariableManagerType } from './widgets-core/managers/interfaces/ICSSVariableManager.js';

// Widget styles types
export type { WidgetStyles, MessagingErrorCode } from './widgets-core/types/widget-styles.js';

// Global configuration helper
export { registerLocale } from './infrastructure/index.js';
