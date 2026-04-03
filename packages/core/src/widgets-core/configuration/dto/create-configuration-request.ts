import type { ConfigObject } from '../../types/common-types.js';
/**
 * Create Configuration Request DTO
 */

export interface CreateConfigurationRequest {
  name: string;
  config: ConfigObject;
  description?: string;
}
