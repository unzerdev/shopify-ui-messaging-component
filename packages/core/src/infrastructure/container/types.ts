/**
 * Dependency Injection Container Types
 */

// Interface constructor type for type-safe interface tokens
export interface InterfaceConstructor<T = unknown> {
  readonly __interfaceType?: T;
}

// Type token for class/interface registration  
export type ServiceToken<T = unknown> =
  | { new (...args: (string | number | boolean | object)[]): T }
  | (abstract new (...args: (string | number | boolean | object)[]) => T)
  | InterfaceConstructor<T>;

// Unified _di function interface with overloads
export interface DIFunction {
  <T>(token: InterfaceConstructor<T>): T;
  <T>(token: new (...args: (string | number | boolean | object)[]) => T): T;
  <T>(token: InterfaceConstructor<T>, factory: () => T, options?: RegistrationOptions): void;
  <T>(token: new (...args: (string | number | boolean | object)[]) => T, factory: () => T, options?: RegistrationOptions): void;
}

// Implementation
export const _di: DIFunction = function <T>(
  token: ServiceToken<T>, 
  factory?: () => T, 
  options?: RegistrationOptions
): T | void {
  const container = getGlobalContainer();

  if (factory) {
    // Register
    container.register(token, factory, options);
    return;
  }

  // Resolve
  return container.resolve<T>(token);
} as DIFunction;

// Global container reference to avoid circular imports
let globalContainerRef: Container | null = null;

export function setGlobalContainer(container: Container): void {
  globalContainerRef = container;
}

function getGlobalContainer(): Container {
  if (!globalContainerRef) {
    throw new Error('DI Container not initialized. Call setGlobalContainer first.');
  }
  return globalContainerRef;
}

// Container interface
export interface Container {
  /**
   * Register a dependency
   */
  register<T>(token: ServiceToken<T>, factory: () => T, options?: RegistrationOptions): void;

  /**
   * Resolve a dependency
   */
  resolve<T>(token: ServiceToken<T>): T;

  /**
   * Check if a dependency is registered
   */
  isRegistered<T>(token: ServiceToken<T>): boolean;
}

// Registration options
export interface RegistrationOptions {
  singleton?: boolean;
}
