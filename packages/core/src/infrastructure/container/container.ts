/**
 * Dependency Injection Container
 * Type-safe implementation for managing dependencies
 */
import { Container, ServiceToken, RegistrationOptions, InterfaceConstructor } from './types.js';

export class DIContainer implements Container {
  private interfaceTokens = new WeakMap<InterfaceConstructor<unknown>, () => unknown>();
  private classTokens = new Map<Function, () => unknown>();
  private singletons = new WeakMap<object, unknown>();
  private singletonTokens = new Set<object>();

  /**
   * Register a dependency (transient or singleton based on options)
   */
  register<T>(token: ServiceToken<T>, factory: () => T, options?: RegistrationOptions): void {
    if (this.isInterfaceToken(token)) {
      this.interfaceTokens.set(token, factory);
    } else {
      this.classTokens.set(token as Function, factory);
    }
    
    if (options?.singleton) {
      this.singletonTokens.add(token as object);
    }
  }

  /**
   * Resolve a dependency
   */
  resolve<T>(token: ServiceToken<T>): T {
    const factory = this.isInterfaceToken(token) 
      ? this.interfaceTokens.get(token)
      : this.classTokens.get(token as Function);

    if (!factory) {
      const tokenName = this.isInterfaceToken(token) ? 'Interface' : (token as Function).name;
      throw new Error(`Dependency '${tokenName}' is not registered`);
    }

    // Check if it's a singleton
    if (this.singletonTokens.has(token as object)) {
      if (!this.singletons.has(token as object)) {
        this.singletons.set(token as object, factory());
      }
      return this.singletons.get(token as object) as T;
    }

    // Return new instance for transient dependencies
    return factory() as T;
  }

  /**
   * Check if a dependency is registered
   */
  isRegistered<T>(token: ServiceToken<T>): boolean {
    return this.isInterfaceToken(token) 
      ? this.interfaceTokens.has(token)
      : this.classTokens.has(token as Function);
  }

  private isInterfaceToken<T>(token: ServiceToken<T>): token is InterfaceConstructor<T> {
    return typeof token === 'object' && '__interfaceType' in token;
  }
}

// Global container instance
export const container = new DIContainer();

// Set global reference for _di function
import { setGlobalContainer } from './types.js';
setGlobalContainer(container);