/**
 * Use Case: ListConfigurations
 * Simple listing with pagination
 */
import { IConfigurationRepository } from '../ports/index.js';
import {
  ListConfigurationsRequest,
  ListConfigurationsResponse,
} from '../dto/index.js';

export class ListConfigurationsUseCase {
  constructor(private repository: IConfigurationRepository) {}

  async execute(request: ListConfigurationsRequest): Promise<ListConfigurationsResponse> {
    try {
      this.validateRequest(request);

      // Get all configurations from repository
      const allConfigurations = await this.repository.findAllConfigurations();

      // Apply search filter if provided
      let filteredConfigurations = allConfigurations;
      if (request.search) {
        const searchLower = request.search.toLowerCase();
        filteredConfigurations = allConfigurations.filter(config =>
          config.name.toLowerCase().includes(searchLower) ||
          (config.description && config.description.toLowerCase().includes(searchLower))
        );
      }

      // Apply sorting
      if (request.sortBy) {
        filteredConfigurations.sort((a, b) => {
          const aValue = a[request.sortBy!];
          const bValue = b[request.sortBy!];
          const order = request.sortOrder === 'desc' ? -1 : 1;

          if (aValue < bValue) return -1 * order;
          if (aValue > bValue) return 1 * order;
          return 0;
        });
      }

      // Apply pagination
      const totalItems = filteredConfigurations.length;
      const totalPages = Math.ceil(totalItems / request.pageSize);
      const startIndex = (request.page - 1) * request.pageSize;
      const endIndex = startIndex + request.pageSize;
      const items = filteredConfigurations.slice(startIndex, endIndex);

      return {
        items,
        totalItems,
        totalPages,
        currentPage: request.page,
        pageSize: request.pageSize,
        hasNextPage: request.page < totalPages,
        hasPreviousPage: request.page > 1,
      };
    } catch (error) {
      // Return empty result on error
      return {
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: request.page,
        pageSize: request.pageSize,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }
  }

  private validateRequest(request: ListConfigurationsRequest): void {
    if (request.page < 1) {
      throw new Error('Page number must be greater than 0');
    }

    if (request.pageSize < 1 || request.pageSize > 100) {
      throw new Error('Page size must be between 1 and 100');
    }
  }
}
