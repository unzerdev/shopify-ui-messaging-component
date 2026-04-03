import type { ConfigObject } from '../../types/common-types.js';
/**
 * Update Configuration Request DTO
 */

export interface UpdateConfigurationRequest {
  id: string;
  name?: string;
  config?: ConfigObject;
  description?: string;
}
