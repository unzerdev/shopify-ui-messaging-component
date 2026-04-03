/**
 * Configuration DataSource that uses Controller
 * Clean implementation with proper layering
 */
import type {
  DataSource,
  DataSourceRequest,
  DataSourceResponse
} from '../../../infrastructure/ui/components/shared/table/table-types.js';
import type { ConfigurationDto } from '../dto/index.js';
import type { ConfigurationController } from '../controllers/configuration-controller.js';
import { logger } from '../../../infrastructure/logging/logger.js';

export class ConfigurationControllerDataSource implements DataSource<ConfigurationDto> {
  constructor(
    private controller: ConfigurationController,
    private loggerContext = 'ConfigurationControllerDataSource'
  ) {}

  async load(request: DataSourceRequest): Promise<DataSourceResponse<ConfigurationDto>> {
    try {
      const response = await this.controller.listConfigurations({
        page: request.pagination.page,
        pageSize: request.pagination.pageSize,
        search: request.search?.term,
        sortBy: request.sort?.field as 'name' | 'createdAt' | 'updatedAt',
        sortOrder: request.sort?.direction,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load configurations');
      }

      const result = response.data;
      return {
        data: result.items,
        pagination: {
          page: result.currentPage,
          pageSize: result.pageSize,
          total: result.totalItems,
          totalPages: result.totalPages,
        },
      };
    } catch (error) {
      logger.error('Failed to load configurations', this.loggerContext, error);
      throw new Error('Failed to load configurations');
    }
  }

  async loadById(id: string): Promise<ConfigurationDto> {
    const response = await this.controller.getConfiguration(id);

    if (!response.success || !response.data?.configuration) {
      throw new Error(response.error || 'Failed to load configuration');
    }

    // Map SavedConfiguration to ConfigurationDto
    const config = response.data.configuration;
    const createdDate = new Date(config.createdAt);
    const updatedDate = new Date(config.updatedAt);
    const ageInDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    const isRecentlyUpdated = (Date.now() - updatedDate.getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 days

    return {
      ...config,
      ageInDays,
      isRecentlyUpdated,
    };
  }

  async import(fileContent: string, fileName: string): Promise<ConfigurationDto> {
    const response = await this.controller.importConfiguration(fileContent, fileName);

    if (!response.success || !response.data?.configuration) {
      throw new Error(response.error || 'Failed to import configuration');
    }

    // Map SavedConfiguration to ConfigurationDto
    const config = response.data.configuration;
    const createdDate = new Date(config.createdAt);
    const updatedDate = new Date(config.updatedAt);
    const ageInDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    const isRecentlyUpdated = (Date.now() - updatedDate.getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 days

    return {
      ...config,
      ageInDays,
      isRecentlyUpdated,
    };
  }

  async delete(id: string): Promise<boolean> {
    const response = await this.controller.deleteConfiguration(id);
    return response.success;
  }

  async save(item: ConfigurationDto): Promise<ConfigurationDto> {
    // If no ID, create new configuration
    if (!item.id || item.id.trim() === '') {
      const response = await this.controller.createConfiguration({
        name: item.name,
        config: item.config,
        description: item.description,
      });

      if (!response.success || !response.data?.configuration) {
        throw new Error('Failed to create configuration');
      }

      // Map SavedConfiguration to ConfigurationDto
      const config = response.data.configuration;
      const createdDate = new Date(config.createdAt);
      const updatedDate = new Date(config.updatedAt);
      const ageInDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      const isRecentlyUpdated = (Date.now() - updatedDate.getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 days

      return {
        ...config,
        ageInDays,
        isRecentlyUpdated,
      };
    } else {
      // If ID exists, update existing configuration
      const response = await this.controller.updateConfiguration({
        id: item.id,
        name: item.name,
        config: item.config,
        description: item.description,
      });

      if (!response.success || !response.data?.configuration) {
        throw new Error('Failed to update configuration');
      }

      // Map SavedConfiguration to ConfigurationDto
      const config = response.data.configuration;
      const createdDate = new Date(config.createdAt);
      const updatedDate = new Date(config.updatedAt);
      const ageInDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      const isRecentlyUpdated = (Date.now() - updatedDate.getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 days

      return {
        ...config,
        ageInDays,
        isRecentlyUpdated,
      };
    }
  }
}
