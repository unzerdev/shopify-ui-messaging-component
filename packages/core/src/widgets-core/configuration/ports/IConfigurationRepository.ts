/**
 * Interface for configuration repository
 * Responsible for CRUD operations on configuration data
 */
import { ConfigurationDto } from '../dto/index.js';

export interface IConfigurationRepository {
  /**
   * Save configuration (create or update)
   */
  saveConfiguration(configuration: ConfigurationDto): Promise<ConfigurationDto>;

  /**
   * Find configuration by ID
   */
  findConfigurationById(id: string): Promise<ConfigurationDto | null>;

  /**
   * Get all configurations
   */
  findAllConfigurations(): Promise<ConfigurationDto[]>;

  /**
   * Delete configuration by ID
   * @returns true if deleted, false if not found
   */
  deleteConfiguration(id: string): Promise<boolean>;

  /**
   * Import configuration from file content
   */
  importConfiguration(fileContent: string, fileName: string): Promise<ConfigurationDto>;
}
