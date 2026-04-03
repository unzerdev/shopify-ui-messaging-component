/**
 * Invoice Widget DI Registration
 */
import { _di, InterfaceConstructor, ILocaleService } from '@unzer/messaging-core';
import type { IConfigurationRepository as IConfigRepo } from '@unzer/messaging-core';
import { type ConfigurationController, registerConfigurationDI } from '@unzer/messaging-core';
import { InvoiceWidget } from '../../InvoiceWidget';
import { logger } from '@unzer/messaging-core';
import { IWidgetRegistry } from '@unzer/messaging-core';
import { invoiceEn } from '../../locales/en.js';
import { invoiceDe } from '../../locales/de.js';
import { invoiceFr } from '../../locales/fr.js';
import { invoiceNl } from '../../locales/nl.js';
import { invoiceEs } from '../../locales/es.js';
import { invoiceIt } from '../../locales/it.js';
import { invoiceNo } from '../../locales/no.js';
import { invoicePt } from '../../locales/pt.js';
import { invoiceSr } from '../../locales/sr.js';
import { invoiceEl } from '../../locales/el.js';
import { invoiceRu } from '../../locales/ru.js';

// Interface tokens for DI (prefixed with IInvoice to avoid collision with installments)
export const IInvoiceConfigurationRepository = {} as InterfaceConstructor<IConfigRepo>;
export const IInvoiceConfigurationController = {} as InterfaceConstructor<ConfigurationController>;

/**
 * Register invoice widget dependencies
 */
export function registerInvoiceDependencies(): void {
  const registry = _di(IWidgetRegistry);

  if (registry.hasWidget('invoice')) {
    return;
  }

  // Configuration CRUD (repository + use cases + controller)
  registerConfigurationDI({
    repositoryToken: IInvoiceConfigurationRepository,
    controllerToken: IInvoiceConfigurationController,
    storageKey: 'unzer-invoice-configurations',
    requiredImportProps: ['layout'],
  });

  // Register widget translations
  const localeService = _di(ILocaleService);
  localeService.registerLocale('en', invoiceEn);
  localeService.registerLocale('de', invoiceDe);
  localeService.registerLocale('fr', invoiceFr);
  localeService.registerLocale('nl', invoiceNl);
  localeService.registerLocale('es', invoiceEs);
  localeService.registerLocale('it', invoiceIt);
  localeService.registerLocale('no', invoiceNo);
  localeService.registerLocale('pt', invoicePt);
  localeService.registerLocale('sr', invoiceSr);
  localeService.registerLocale('el', invoiceEl);
  localeService.registerLocale('ru', invoiceRu);

  const invoiceWidget = new InvoiceWidget();
  registry.registerWidget(invoiceWidget);

  logger.info('Invoice widget registered', 'WidgetBootstrap', {
    id: invoiceWidget.id,
    name: invoiceWidget.name
  });
}
