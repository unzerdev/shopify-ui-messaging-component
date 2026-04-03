/**
 * Core Configuration Module
 * Shared configuration CRUD logic for all widgets
 */

// DTOs
export type {
  ConfigurationDto,
  ControllerResponse,
  CreateConfigurationRequest,
  UpdateConfigurationRequest,
  ListConfigurationsRequest,
  ListConfigurationsResponse,
} from './dto/index.js';

// Ports
export type { IConfigurationRepository } from './ports/index.js';

// Controllers
export { BaseController } from './controllers/base-controller.js';
export { ConfigurationController } from './controllers/configuration-controller.js';

// Providers
export { DefaultTableProvider } from './providers/default-table-provider.js';

// DataSources
export { ConfigurationControllerDataSource } from './datasources/configuration-controller-datasource.js';

// DI Helper
export { registerConfigurationDI } from './di/register-configuration-di.js';
export type { ConfigurationDIOptions } from './di/register-configuration-di.js';
