/**
 * Core Bootstrap - Initializes DI container and core services
 * Must be called before any widget code runs.
 * Idempotent - safe to call multiple times.
 */

// Make customElements.define idempotent to survive UMD script re-execution.
// When Shopify's section renderer morphs the DOM, UMD scripts re-run and
// @customElement decorators fire again. Without this patch, the browser throws
// NotSupportedError on the duplicate define() call, killing script execution.
(function patchCustomElementsRegistry() {
  const original = customElements.define;
  if ((customElements as unknown as Record<string, boolean>).__unzerPatched) return;
  (customElements as unknown as Record<string, boolean>).__unzerPatched = true;
  customElements.define = function (
    name: string,
    constructor: CustomElementConstructor,
    options?: ElementDefinitionOptions,
  ) {
    if (!customElements.get(name)) {
      return original.call(this, name, constructor, options);
    }
  };
})();

import { _di, DIContainer, setGlobalContainer, IUnzerServiceConfig, getCurrentUnzerConfig, setUnzerConfig } from './infrastructure/index.js';
import { ILocaleService, LocaleService } from './infrastructure/index.js';
import { logger } from './infrastructure/logging/logger.js';
import { CSSVariableManager } from './widgets-core/managers/css-variable-manager.js';
import { WidgetRegistry } from './widgets-core/widget-registry.js';
import { registerMessagingDependencies } from './widgets-core/messaging/index.js';
import { InterfaceConstructor } from './infrastructure/index.js';
import type { ICSSVariableManager as ICSSVariableManagerType } from './widgets-core/managers/interfaces/ICSSVariableManager.js';
import type { IWidgetRegistry as IWidgetRegistryType } from './widgets-core/interfaces/IWidgetRegistry.js';

// DI tokens
export const ICSSVariableManager = {} as InterfaceConstructor<ICSSVariableManagerType>;
export const IWidgetRegistry = {} as InterfaceConstructor<IWidgetRegistryType>;

let _bootstrapped = false;

/**
 * Bootstrap core services. Idempotent - safe to call multiple times.
 */
export function bootstrapCore(): void {
  if (_bootstrapped) return;
  _bootstrapped = true;

  // Initialize DI container
  const container = new DIContainer();
  setGlobalContainer(container);

  // Register infrastructure services
  _di(IUnzerServiceConfig, () => getCurrentUnzerConfig(), { singleton: true });

  // Register i18n service
  _di(ILocaleService, () => new LocaleService(), { singleton: true });

  // Register core widget services
  _di(ICSSVariableManager, () => new CSSVariableManager(), { singleton: true });
  registerMessagingDependencies();
  _di(IWidgetRegistry, () => new WidgetRegistry(), { singleton: true });

  logger.info('Core bootstrapped', 'Bootstrap');
}

// Re-export config helper
export { setUnzerConfig };
