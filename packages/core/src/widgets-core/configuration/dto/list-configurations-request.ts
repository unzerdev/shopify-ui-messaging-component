/**
 * List Configurations Request DTO
 */

export interface ListConfigurationsRequest {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
