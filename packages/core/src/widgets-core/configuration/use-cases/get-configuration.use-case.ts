/**
 * Use Case: GetConfiguration
 */
import { IConfigurationRepository } from '../ports/index.js';
import type { ConfigurationResponse } from '../../types/configuration.js';

export class GetConfigurationUseCase {
  constructor(private repository: IConfigurationRepository) {}

  async execute(id: string): Promise<ConfigurationResponse> {
    try {
      if (!id || id.trim().length === 0) {
        throw new Error('Configuration ID is required');
      }

      const configDto = await this.repository.findConfigurationById(id);

      // Map ConfigurationDto to SavedConfiguration
      const configuration = configDto ? {
        id: configDto.id,
        name: configDto.name,
        config: configDto.config,
        description: configDto.description,
        createdAt: configDto.createdAt,
        updatedAt: configDto.updatedAt,
      } : undefined;

      return {
        configuration,
        success: true,
      };
    } catch (error) {
      return {
        configuration: undefined,
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to get configuration'],
      };
    }
  }
}
