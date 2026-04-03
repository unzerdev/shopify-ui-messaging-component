/**
 * Use Case: CreateConfiguration
 */
import { IConfigurationRepository } from '../ports/index.js';
import {
  CreateConfigurationRequest,
  ConfigurationDto,
} from '../dto/index.js';
import type { ConfigurationResponse } from '../../types/configuration.js';

export class CreateConfigurationUseCase {
  constructor(private repository: IConfigurationRepository) {}

  async execute(request: CreateConfigurationRequest): Promise<ConfigurationResponse> {
    try {
      this.validateCreateRequest(request);

      const configuration: ConfigurationDto = {
        id: this.generateId(),
        name: request.name,
        config: request.config,
        description: request.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ageInDays: 0,
        isRecentlyUpdated: true,
      };

      await this.repository.saveConfiguration(configuration);

      return {
        configuration,
        success: true,
      };
    } catch (error) {
      return {
        configuration: undefined,
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to create configuration'],
      };
    }
  }

  private validateCreateRequest(request: CreateConfigurationRequest): void {
    if (!request.name || request.name.trim().length === 0) {
      throw new Error('Configuration name is required');
    }

    if (!request.config) {
      throw new Error('Configuration data is required');
    }
  }

  private generateId(): string {
    return `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
