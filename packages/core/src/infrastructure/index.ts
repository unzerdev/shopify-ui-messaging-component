/**
 * Infrastructure Module
 * All infrastructure components and utilities
 */

// Import CSS for bundling
import './ui/styles/base.css';

// Export all input components
export { UnzerTextInput } from './ui/components/shared/input/text/unzer-text-input.js';
export { UnzerFileInput } from './ui/components/shared/input/file/unzer-file-input.js';
export { UnzerCheckboxInput } from './ui/components/shared/input/checkbox/unzer-checkbox-input.js';
export { UnzerRangeInput } from './ui/components/shared/input/range/unzer-range-input.js';
export { UnzerColorInput } from './ui/components/shared/input/color/unzer-color-input.js';
export { UnzerTextarea } from './ui/components/shared/textarea/unzer-textarea.js';
export { UnzerInclude } from './ui/components/shared/include/unzer-include.js';
export { UnzerModal } from './ui/components/shared/modal/unzer-modal.js';
export {
  UnzerSelect,
  type SelectOption,
} from './ui/components/shared/select/unzer-select.js';
export { UnzerButton } from './ui/components/shared/button/unzer-button.js';
export { UnzerFormGroup } from './ui/components/shared/form/unzer-form-group.js';
export { UnzerFormSection } from './ui/components/shared/form/unzer-form-section.js';
export { UnzerCard } from './ui/components/shared/layout/unzer-card.js';
export { UnzerTabContainer } from './ui/components/shared/tabs/unzer-tab-container.js';

// DI Container exports
export {
  _di,
  DIContainer,
  setGlobalContainer,
  type Container,
  type RegistrationOptions,
  type ServiceToken,
  type InterfaceConstructor
} from './container/index.js';

// Configuration exports
export { 
  setUnzerConfig,
  getCurrentUnzerConfig,
  IUnzerServiceConfig,
  type UnzerServiceConfig 
} from './config/index.js';

// Type exports
export type { BaseConfig } from './types/config.types.js';

// Error exports
export { BaseError } from './errors/base-error.js';
export * from './errors/infrastructure-error.js';

// i18n exports
export { LocaleService, ILocaleService, registerLocale, LOCALE_OPTIONS, type TranslationMap } from './i18n/index.js';

// Security exports
export { sanitizeHTML, sanitizeHTMLWithScripts } from './security/index.js';

// UI Base and utilities
export { UnzerElement } from './ui/base/unzer-element.js';
export { cssText } from './ui/utils/css-utils.js';
export { TableAdapter } from './ui/components/shared/table/table-adapter.js';

// Automatically register all input components when imported
import './ui/components/shared/input/text/unzer-text-input.js';
import './ui/components/shared/input/file/unzer-file-input.js';
import './ui/components/shared/input/checkbox/unzer-checkbox-input.js';
import './ui/components/shared/input/range/unzer-range-input.js';
import './ui/components/shared/input/color/unzer-color-input.js';
import './ui/components/shared/include/unzer-include.js';
import './ui/components/shared/modal/unzer-modal.js';
import './ui/components/shared/select/unzer-select.js';
import './ui/components/shared/button/unzer-button.js';
import './ui/components/shared/form/unzer-form-group.js';
import './ui/components/shared/form/unzer-form-section.js';
import './ui/components/shared/layout/unzer-card.js';
import './ui/components/shared/tabs/unzer-tab-container.js';
import './ui/components/shared/textarea/unzer-textarea.js';
// Drag components
import './ui/components/shared/drag/unzer-drag-option.js';
import './ui/components/shared/drag/unzer-drag-zone.js';