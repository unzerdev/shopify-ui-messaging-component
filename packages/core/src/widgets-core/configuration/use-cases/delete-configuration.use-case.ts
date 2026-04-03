/**
 * Use Case: DeleteConfiguration
 */
import { IConfigurationRepository } from '../ports/index.js';
import type { DeleteConfigurationResponse } from '../../types/configuration.js';

export class DeleteConfigurationUseCase {
  constructor(private repository: IConfigurationRepository) {}

  async execute(id: string): Promise<DeleteConfigurationResponse> {
    try {
      if (!id || id.trim().length === 0) {
        throw new Error('Configuration ID is required');
      }

      const deleted = await this.repository.deleteConfiguration(id);

      return {
        deleted,
        success: true,
      };
    } catch (error) {
      return {
        deleted: false,
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to delete configuration'],
      };
    }
  }
}
