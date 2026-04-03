/**
 * Dependency Injection Container - Public API
 */

export { container, DIContainer } from './container.js';
export type { Container, RegistrationOptions, ServiceToken, InterfaceConstructor } from './types.js';
export { _di, setGlobalContainer } from './types.js';

// Config exports moved to infrastructure/config
export { IUnzerServiceConfig, type UnzerServiceConfig } from '../config/index.js';
