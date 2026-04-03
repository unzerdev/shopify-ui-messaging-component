/**
 * Use Case: UpdateConfiguration
 */
import { IConfigurationRepository } from '../ports/index.js';
import {
  UpdateConfigurationRequest,
  ConfigurationDto,
} from '../dto/index.js';
import type { ConfigurationResponse } from '../../types/configuration.js';

export class UpdateConfigurationUseCase {
  constructor(private repository: IConfigurationRepository) {}

  async execute(request: UpdateConfigurationRequest): Promise<ConfigurationResponse> {
    try {
      this.validateUpdateRequest(request);

      const existing = await this.repository.findConfigurationById(request.id);
      if (!existing) {
        throw new Error('Configuration not found');
      }

      const updated: ConfigurationDto = {
        ...existing,
        name: request.name ?? existing.name,
        config: request.config ?? existing.config,
        description: request.description ?? existing.description,
        updatedAt: new Date().toISOString(),
        isRecentlyUpdated: true,
      };

      await this.repository.saveConfiguration(updated);

      // Map ConfigurationDto to SavedConfiguration
      const configuration = {
        id: updated.id,
        name: updated.name,
        config: updated.config,
        description: updated.description,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };

      return {
        configuration,
        success: true,
      };
    } catch (error) {
      return {
        configuration: undefined,
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to update configuration'],
      };
    }
  }

  private validateUpdateRequest(request: UpdateConfigurationRequest): void {
    if (!request.id || request.id.trim().length === 0) {
      throw new Error('Configuration ID is required');
    }
  }
}
