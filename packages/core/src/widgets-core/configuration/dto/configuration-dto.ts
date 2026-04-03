import type { ConfigObject } from '../../types/common-types.js';

/**
 * Configuration DTO
 */
export interface ConfigurationDto {
  id: string;
  name: string;
  description?: string;
  config: ConfigObject;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  ageInDays: number; // Calculated field
  isRecentlyUpdated: boolean; // Calculated field
}
