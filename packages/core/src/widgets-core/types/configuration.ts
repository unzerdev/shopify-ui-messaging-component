/**
 * Core Configuration Types
 * Shared configuration DTOs that can be used by any widget
 */

/**
 * Saved Configuration Interface
 * Generic configuration that any widget can use
 */
export interface SavedConfiguration {
  id: string;
  name: string;
  config: Record<string, unknown>;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Configuration Response Interface
 */
export interface ConfigurationResponse {
  configuration?: SavedConfiguration;
  success: boolean;
  error?: string;
  errors?: string[];
}

/**
 * Delete Configuration Response Interface
 */
export interface DeleteConfigurationResponse {
  deleted: boolean;
  success: boolean;
  errors?: string[];
}