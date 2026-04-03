/**
 * Infrastructure Configuration Management
 * Handles global configuration without widget dependencies
 */

import { InterfaceConstructor } from '../container/types.js';

// Service configuration interface
export interface UnzerServiceConfig {
  publicKey: string;
  apiUrl: string;
  timeout: number;
}

// Service interface token
export const IUnzerServiceConfig = {} as InterfaceConstructor<UnzerServiceConfig>;

// Global config holder
let globalUnzerConfig: Partial<UnzerServiceConfig> = {};

/**
 * Set global Unzer configuration
 */
export function setUnzerConfig(config: Partial<UnzerServiceConfig>): void {
  globalUnzerConfig = { ...globalUnzerConfig, ...config };
}

/**
 * Get current Unzer configuration (always fresh)
 */
export function getCurrentUnzerConfig(): UnzerServiceConfig {
  return {
    publicKey: globalUnzerConfig.publicKey || 's-pub-default',
    apiUrl: globalUnzerConfig.apiUrl || 'https://api.unzer.com/v1',
    timeout: globalUnzerConfig.timeout || 10000,
  };
}