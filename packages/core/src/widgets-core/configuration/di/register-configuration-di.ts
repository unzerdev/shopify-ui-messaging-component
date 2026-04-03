/**
 * Configuration DI Registration Helper
 * Registers all standard configuration CRUD dependencies for a widget
 */
import { _di } from '../../../infrastructure/index.js';
import type { InterfaceConstructor } from '../../../infrastructure/index.js';
import type { IConfigurationRepository } from '../ports/index.js';
import type { ConfigurationController } from '../controllers/configuration-controller.js';
import { ConfigurationRepository } from '../repositories/configuration-repository.js';
import { ListConfigurationsUseCase } from '../use-cases/list-configurations.use-case.js';
import { CreateConfigurationUseCase } from '../use-cases/create-configuration.use-case.js';
import { UpdateConfigurationUseCase } from '../use-cases/update-configuration.use-case.js';
import { GetConfigurationUseCase } from '../use-cases/get-configuration.use-case.js';
import { DeleteConfigurationUseCase } from '../use-cases/delete-configuration.use-case.js';
import { ImportConfigurationUseCase } from '../use-cases/import-configuration.use-case.js';
import { ConfigurationController as ConfigControllerImpl } from '../controllers/configuration-controller.js';

export interface ConfigurationDIOptions {
  repositoryToken: InterfaceConstructor<IConfigurationRepository>;
  controllerToken: InterfaceConstructor<ConfigurationController>;
  storageKey: string;
  requiredImportProps?: string[];
}

/**
 * Register all configuration CRUD dependencies for a widget.
 * Creates: repository (singleton), all 6 use cases (inline), controller (singleton).
 */
export function registerConfigurationDI(options: ConfigurationDIOptions): void {
  const { repositoryToken, controllerToken, storageKey, requiredImportProps = [] } = options;

  // Repository (Singleton)
  _di(repositoryToken, () => {
    return new ConfigurationRepository(storageKey, requiredImportProps);
  }, { singleton: true });

  // Controller (Singleton) — use cases are created inline
  _di(controllerToken, () => {
    const repository = _di(repositoryToken);

    const listUseCase = new ListConfigurationsUseCase(repository);
    const createUseCase = new CreateConfigurationUseCase(repository);
    const updateUseCase = new UpdateConfigurationUseCase(repository);
    const getUseCase = new GetConfigurationUseCase(repository);
    const deleteUseCase = new DeleteConfigurationUseCase(repository);
    const importUseCase = new ImportConfigurationUseCase(repository, requiredImportProps);

    return new ConfigControllerImpl(
      listUseCase,
      createUseCase,
      updateUseCase,
      getUseCase,
      deleteUseCase,
      importUseCase
    );
  }, { singleton: true });
}
