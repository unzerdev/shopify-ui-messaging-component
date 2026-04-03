/**
 * Handles configuration-related operations for UI components
 */
import { BaseController, ControllerResponse } from './base-controller.js';
import { ListConfigurationsUseCase } from '../use-cases/list-configurations.use-case.js';
import { CreateConfigurationUseCase } from '../use-cases/create-configuration.use-case.js';
import { UpdateConfigurationUseCase } from '../use-cases/update-configuration.use-case.js';
import { GetConfigurationUseCase } from '../use-cases/get-configuration.use-case.js';
import { DeleteConfigurationUseCase } from '../use-cases/delete-configuration.use-case.js';
import { ImportConfigurationUseCase } from '../use-cases/import-configuration.use-case.js';
import type {
  CreateConfigurationRequest,
  ListConfigurationsRequest,
  ListConfigurationsResponse,
  UpdateConfigurationRequest,
} from '../dto/index.js';
import type {
  ConfigurationResponse,
  DeleteConfigurationResponse
} from '../../types/configuration.js';

export class ConfigurationController extends BaseController {
  constructor(
    private listConfigurationsUseCase: ListConfigurationsUseCase,
    private createConfigurationUseCase: CreateConfigurationUseCase,
    private updateConfigurationUseCase: UpdateConfigurationUseCase,
    private getConfigurationUseCase: GetConfigurationUseCase,
    private deleteConfigurationUseCase: DeleteConfigurationUseCase,
    private importConfigurationUseCase: ImportConfigurationUseCase
  ) {
    super();
  }

  /**
   * List all configurations
   */
  async listConfigurations(
    request: ListConfigurationsRequest = { page: 1, pageSize: 10 }
  ): Promise<ControllerResponse<ListConfigurationsResponse>> {
    return this.handleRequest(async () => {
      return await this.listConfigurationsUseCase.execute(request);
    });
  }

  /**
   * Create new configuration
   */
  async createConfiguration(
    request: CreateConfigurationRequest
  ): Promise<ControllerResponse<ConfigurationResponse>> {
    return this.handleRequest(async () => {
      const response = await this.createConfigurationUseCase.execute(request);
      if (!response.success) {
        throw new Error(response.errors?.join(', ') || 'Failed to create configuration');
      }

      return response;
    });
  }

  /**
   * Update existing configuration
   */
  async updateConfiguration(
    request: UpdateConfigurationRequest
  ): Promise<ControllerResponse<ConfigurationResponse>> {
    return this.handleRequest(async () => {
      const response = await this.updateConfigurationUseCase.execute(request);

      if (!response.success) {
        throw new Error(response.errors?.join(', ') || 'Failed to update configuration');
      }

      return response;
    });
  }

  /**
   * Delete configuration
   */
  async deleteConfiguration(id: string): Promise<ControllerResponse<DeleteConfigurationResponse>> {
    return this.handleRequest(async () => {
      const response = await this.deleteConfigurationUseCase.execute(id);

      if (!response.success) {
        throw new Error(response.errors?.join(', ') || 'Failed to delete configuration');
      }

      return response;
    });
  }

  /**
   * Get configuration by ID
   */
  async getConfiguration(id: string): Promise<ControllerResponse<ConfigurationResponse>> {
    return this.handleRequest(async () => {
      const response = await this.getConfigurationUseCase.execute(id);

      if (!response.success) {
        throw new Error(response.errors?.join(', ') || 'Failed to get configuration');
      }

      return response;
    });
  }

  /**
   * Import configuration from file content
   */
  async importConfiguration(
    fileContent: string,
    fileName: string
  ): Promise<ControllerResponse<ConfigurationResponse>> {
    return this.handleRequest(async () => {
      const response = await this.importConfigurationUseCase.execute({
        fileContent,
        fileName,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to import configuration');
      }

      return {
        success: true,
        data: response.data!,
      };
    });
  }
}
