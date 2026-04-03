import type { ConfigObject } from '../../types/common-types.js';
/**
 * Local Storage Configuration Repository Implementation
 * Handles CRUD operations for configurations using localStorage
 */
import type { ConfigurationDto } from '../dto/index.js';
import type { IConfigurationRepository } from '../ports/index.js';
import { logger } from '../../../infrastructure/logging/logger.js';

interface StoredConfiguration {
  id: string;
  name: string;
  config: ConfigObject;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export class ConfigurationRepository implements IConfigurationRepository {
  constructor(
    private readonly storageKey: string,
    private readonly requiredImportProps: string[] = []
  ) {}

  async saveConfiguration(configuration: ConfigurationDto): Promise<ConfigurationDto> {
    const configurations = await this.loadAllConfigurations();
    const existingIndex = configurations.findIndex(c => c.id === configuration.id);

    if (existingIndex >= 0) {
      configurations[existingIndex] = configuration;
    } else {
      configurations.push(configuration);
    }

    await this.saveAllConfigurations(configurations);
    return configuration;
  }

  async findConfigurationById(id: string): Promise<ConfigurationDto | null> {
    const configurations = await this.loadAllConfigurations();
    const found = configurations.find(c => c.id === id);
    return found || null;
  }

  async findAllConfigurations(): Promise<ConfigurationDto[]> {
    return await this.loadAllConfigurations();
  }

  async deleteConfiguration(id: string): Promise<boolean> {
    const configurations = await this.loadAllConfigurations();
    const initialLength = configurations.length;
    const filtered = configurations.filter(c => c.id !== id);

    if (filtered.length < initialLength) {
      await this.saveAllConfigurations(filtered);
      return true;
    }

    return false;
  }

  private async loadAllConfigurations(): Promise<ConfigurationDto[]> {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];

      const configs = JSON.parse(data);
      if (!(configs instanceof Array)) {
        logger.warn('Invalid configuration data format, clearing corrupted data', 'ConfigurationRepository', { data });
        localStorage.removeItem(this.storageKey);
        return [];
      }

      // Transform to DTOs with calculated fields
      return configs.map((config: StoredConfiguration) => ({
        id: config.id,
        name: config.name,
        config: config.config,
        description: config.description,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
        ageInDays: Math.floor((Date.now() - new Date(config.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
        isRecentlyUpdated: (Date.now() - new Date(config.updatedAt).getTime()) < (7 * 24 * 60 * 60 * 1000), // 7 days
      }));
    } catch (error) {
      logger.error('Error loading configurations', 'ConfigurationRepository', { error });
      return [];
    }
  }

  async importConfiguration(fileContent: string, fileName: string): Promise<ConfigurationDto> {
    try {
      // Parse JSON content
      let configData: unknown;
      try {
        configData = JSON.parse(fileContent);
      } catch (parseError) {
        throw new Error('Invalid JSON format in uploaded file');
      }

      // Validate configuration structure
      this.validateConfigurationData(configData);

      // Generate new ID and timestamps for imported config
      const importedConfig: ConfigurationDto = {
        id: this.generateId(),
        name: (configData as Record<string, unknown>).name + ' (Imported)',
        config: (configData as Record<string, unknown>).config as Record<string, unknown>,
        description: (configData as Record<string, unknown>).description as string || 'Imported from ' + fileName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ageInDays: 0,
        isRecentlyUpdated: true,
      };

      // Save imported configuration using existing save method
      return await this.saveConfiguration(importedConfig);
    } catch (error) {
      logger.error('Error importing configuration', 'ConfigurationRepository', { error });
      throw new Error(error instanceof Error ? error.message : 'Failed to import configuration');
    }
  }

  private validateConfigurationData(data: unknown): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Configuration must be a valid object');
    }

    if (!(data as Record<string, unknown>).name || typeof (data as Record<string, unknown>).name !== 'string') {
      throw new Error('Configuration must have a valid name');
    }

    if (!(data as Record<string, unknown>).config || typeof (data as Record<string, unknown>).config !== 'object') {
      throw new Error('Configuration must have a valid config object');
    }

    // Validate required config properties
    for (const prop of this.requiredImportProps) {
      const dataObj = data as Record<string, unknown>;
      const configObj = dataObj.config as Record<string, unknown>;
      if (!(prop in configObj)) {
        throw new Error(`Configuration must include ${prop} property`);
      }
    }
  }

  private generateId(): string {
    return 'imported_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private async saveAllConfigurations(configurations: ConfigurationDto[]): Promise<void> {
    try {
      const data = configurations.map(config => ({
        id: config.id,
        name: config.name,
        config: config.config,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
        description: config.description,
      }));

      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      logger.error('Error saving configurations', 'ConfigurationRepository', { error });
      throw new Error('Failed to save configuration');
    }
  }
}
