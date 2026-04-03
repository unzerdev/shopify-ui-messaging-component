/**
 * Installments Widget DI Registration
 */
import { _di, InterfaceConstructor, ILocaleService } from '@unzer/messaging-core';
import { IUnzerServiceConfig } from '@unzer/messaging-core';
import { installmentsEn } from '../../locales/en.js';
import { installmentsDe } from '../../locales/de.js';
import { installmentsFr } from '../../locales/fr.js';
import { installmentsNl } from '../../locales/nl.js';
import { installmentsEs } from '../../locales/es.js';
import { installmentsIt } from '../../locales/it.js';
import { installmentsNo } from '../../locales/no.js';
import { installmentsPt } from '../../locales/pt.js';
import { installmentsSr } from '../../locales/sr.js';
import { installmentsEl } from '../../locales/el.js';
import { installmentsRu } from '../../locales/ru.js';
import { InstallmentController } from '../controllers/installment.controller.js';
import { GetInstallmentPlansUseCase } from '../../application/use-cases/installment/get-installment-plans.use-case.js';

// Import new repository implementations
import { InstallmentRepository } from '../repositories/InstallmentRepository';

// Import interfaces
import {
  IInstallmentDataRepository as IInstallmentDataRepo,
} from '../../application/ports/index.js';
import type { IConfigurationRepository as IConfigRepo } from '@unzer/messaging-core';
import { type ConfigurationController, registerConfigurationDI } from '@unzer/messaging-core';
import { InstallmentWidget } from '../../InstallmentWidget';
import { logger } from '@unzer/messaging-core';
import { IWidgetRegistry } from '@unzer/messaging-core';

// Interface tokens for DI
export const IInstallmentDataRepository = {} as InterfaceConstructor<IInstallmentDataRepo>;
export const IConfigurationRepository = {} as InterfaceConstructor<IConfigRepo>;

// Use Case interface tokens (installment-specific only)
export const IGetInstallmentPlansUseCase = {} as InterfaceConstructor<GetInstallmentPlansUseCase>;
export const IInstallmentController = {} as InterfaceConstructor<InstallmentController>;
export const IConfigurationController = {} as InterfaceConstructor<ConfigurationController>;

/**
 * Register installments widget dependencies
 */
export function registerInstallmentsDependencies(): void {
  const registry = _di(IWidgetRegistry);
  // Register Installments Widget
  if (registry.hasWidget('installments')) {
    return;
  }

  // Configuration CRUD (repository + use cases + controller)
  registerConfigurationDI({
    repositoryToken: IConfigurationRepository,
    controllerToken: IConfigurationController,
    storageKey: 'unzer-installment-configurations',
    requiredImportProps: ['publicKey', 'amount', 'currency', 'country'],
  });

  // Installment-specific repositories
  _di(IInstallmentDataRepository, () => {
    const config = _di(IUnzerServiceConfig);
    return new InstallmentRepository(config.apiUrl);
  }, { singleton: true });

  // Installment-specific use cases
  _di(IGetInstallmentPlansUseCase, () => {
    const repository = _di(IInstallmentDataRepository);
    return new GetInstallmentPlansUseCase(repository);
  });

  // Controllers (Singleton)
  _di(IInstallmentController, () => {
    const useCase = _di(IGetInstallmentPlansUseCase);
    return new InstallmentController(useCase);
  }, { singleton: true });

  // Register widget translations
  const localeService = _di(ILocaleService);
  localeService.registerLocale('en', installmentsEn);
  localeService.registerLocale('de', installmentsDe);
  localeService.registerLocale('fr', installmentsFr);
  localeService.registerLocale('nl', installmentsNl);
  localeService.registerLocale('es', installmentsEs);
  localeService.registerLocale('it', installmentsIt);
  localeService.registerLocale('no', installmentsNo);
  localeService.registerLocale('pt', installmentsPt);
  localeService.registerLocale('sr', installmentsSr);
  localeService.registerLocale('el', installmentsEl);
  localeService.registerLocale('ru', installmentsRu);

  const installmentWidget = new InstallmentWidget();
  registry.registerWidget(installmentWidget);

  logger.info('Installments widget registered', 'WidgetBootstrap', {
    id: installmentWidget.id,
    name: installmentWidget.name
  });
}

// Re-export tokens for external use
export { InstallmentController };
