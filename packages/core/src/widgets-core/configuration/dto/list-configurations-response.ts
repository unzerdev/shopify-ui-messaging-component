/**
 * List Configurations Response DTO
 */
import { ConfigurationDto } from './configuration-dto.js';

export interface ListConfigurationsResponse {
  items: ConfigurationDto[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
