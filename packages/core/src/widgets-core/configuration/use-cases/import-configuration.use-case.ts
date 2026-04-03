/**
 * Use Case: ImportConfiguration
 * Imports configuration from JSON file and saves it
 */
import { ConfigurationDto } from '../dto/index.js';
import { IConfigurationRepository } from '../ports/index.js';
import type { ConfigObject } from '../../types/common-types.js';

export interface ImportConfigurationRequest {
  fileContent: string;
  fileName: string;
}

export interface ImportConfigurationResponse {
  success: boolean;
  data?: ConfigurationDto;
  error?: string;
}

export class ImportConfigurationUseCase {
  constructor(
    private repository: IConfigurationRepository,
    private requiredImportProps: string[] = []
  ) {}

  async execute(request: ImportConfigurationRequest): Promise<ImportConfigurationResponse> {
    try {
      // Validate input
      this.validateRequest(request);

      // Parse JSON content
      let configData: unknown;
      try {
        configData = JSON.parse(request.fileContent);
      } catch (parseError) {
        throw new Error('Invalid JSON format in uploaded file');
      }

      // Validate configuration structure
      this.validateConfigurationData(configData);

      // Type assertion after validation
      const validatedConfigData = configData as { name: string; config: object; description?: string };

      // Generate new ID and timestamps for imported config
      const importedConfig: ConfigurationDto = {
        id: this.generateId(),
        name: validatedConfigData.name + ' (Imported)',
        config: validatedConfigData.config as ConfigObject,
        description: validatedConfigData.description || 'Imported from ' + request.fileName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ageInDays: 0,
        isRecentlyUpdated: true,
      };

      // Save imported configuration
      const savedConfig = await this.repository.saveConfiguration(importedConfig);

      return {
        success: true,
        data: savedConfig,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during import',
      };
    }
  }

  private validateRequest(request: ImportConfigurationRequest): void {
    if (!request.fileContent || typeof request.fileContent !== 'string') {
      throw new Error('File content is required');
    }

    if (!request.fileName || typeof request.fileName !== 'string') {
      throw new Error('File name is required');
    }

    if (!request.fileName.toLowerCase().endsWith('.json')) {
      throw new Error('Only JSON files are supported');
    }
  }

  private validateConfigurationData(data: unknown): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Configuration must be a valid object');
    }

    const dataObj = data as Record<string, unknown>;

    if (!dataObj.name || typeof dataObj.name !== 'string') {
      throw new Error('Configuration must have a valid name');
    }

    if (!dataObj.config || typeof dataObj.config !== 'object') {
      throw new Error('Configuration must have a valid config object');
    }

    // Validate required config properties
    const configObj = dataObj.config as Record<string, unknown>;
    for (const prop of this.requiredImportProps) {
      if (!(prop in configObj)) {
        throw new Error(`Configuration must include ${prop} property`);
      }
    }
  }

  private generateId(): string {
    return 'imported_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
