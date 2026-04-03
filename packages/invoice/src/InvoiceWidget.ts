/**
 * Invoice Widget Implementation
 */
import { html, TemplateResult } from 'lit';
import { WidgetConfig, AbstractWidget, type FieldSchema } from '@unzer/messaging-core';
import type { IWidgetTableProvider } from '@unzer/messaging-core';
import { DefaultTableProvider } from '@unzer/messaging-core';
import { IInvoiceConfigurationController } from './infrastructure/di/invoice-di.js';
import { INVOICE_CONFIG_SCHEMA } from './config/invoice-schema.js';
import { CodePreviewTemplate } from './templates/code-preview-template.js';

export class InvoiceWidget extends AbstractWidget {
  readonly id = 'invoice';
  readonly name = 'Invoice';
  readonly schema = INVOICE_CONFIG_SCHEMA;

  /**
   * Provides table configuration for Save/Load functionality
   */
  getTableProvider(): IWidgetTableProvider<unknown> {
    return new DefaultTableProvider(IInvoiceConfigurationController) as IWidgetTableProvider<unknown>;
  }

  /**
   * Transform style values for invoice-specific needs
   */
  protected transformStyleValue(fieldKey: string, value: unknown, field?: FieldSchema): string {
    if (fieldKey === 'shadow') {
      if (value === true) return '0 2px 8px rgba(0, 0, 0, 0.1)';
      if (value === false) return '';
      return String(value);
    }
    return super.transformStyleValue(fieldKey, value, field);
  }

  /**
   * Renders live preview of invoice banner component
   */
  renderPreview(config: WidgetConfig): TemplateResult {
    const inlineStyles = this.generateDirectStyles(config);

    return html`
      <unzer-invoice-widget
        locale="${config.locale || 'en'}"
        info-button-layout="${config.infoButtonLayout ?? 'icon'}"
        unzer-logo-display="${config.unzerLogoDisplay ?? 'unzer-logo'}"
        unzer-logo-position="${config.unzerLogoPosition ?? 'right'}"
        expiry-days="${config.expiryDays ?? 14}"
        .previewMode="${config.previewMode !== false}"
        style="${inlineStyles}"
      >
      </unzer-invoice-widget>
    `;
  }

  /**
   * Renders configuration interface for invoice widget
   */
  renderConfiguration(config: WidgetConfig): TemplateResult {
    const configKey = JSON.stringify(config);
    return html`
      <unzer-schema-config
        locale="${config.locale || 'en'}"
        .schema="${INVOICE_CONFIG_SCHEMA}"
        .config="${config}"
        key="${configKey}">
      </unzer-schema-config>
    `;
  }

  /**
   * Generates HTML code for invoice component integration
   */
  generateCode(_config: WidgetConfig): string {
    return CodePreviewTemplate.generateCode(_config);
  }

}
