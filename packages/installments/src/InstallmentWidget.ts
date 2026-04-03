/**
 * Installment Widget Implementation
 */
import { html, TemplateResult } from 'lit';
import { WidgetConfig, AbstractWidget, type FieldSchema } from '@unzer/messaging-core';
import { INSTALLMENT_CONFIG_SCHEMA } from './config/installment-schema.js';
import type { IWidgetTableProvider } from '@unzer/messaging-core';
import { DefaultTableProvider } from '@unzer/messaging-core';
import { IConfigurationController } from './infrastructure/di/installments-di.js';
import { CodePreviewTemplate } from './templates/code-preview-template.js';

export class InstallmentWidget extends AbstractWidget {
  readonly id = 'installments';
  readonly name = 'Installment Plans';
  readonly schema = INSTALLMENT_CONFIG_SCHEMA;

  /**
   * Transform style values for installment-specific needs
   * Override for shadow field - convert boolean to CSS shadow value
   */
  protected transformStyleValue(fieldKey: string, value: unknown, field?: FieldSchema): string {
    if (fieldKey === 'widgetHeight') {
      const numVal = typeof value === 'number' ? value : parseFloat(String(value));
      if (numVal <= 0 || isNaN(numVal)) {
        return 'auto';
      }
      return `${numVal}px`;
    }

    if (fieldKey === 'shadow') {
      if (value === true) {
        return '0 2px 8px rgba(0, 0, 0, 0.1)';
      } else if (value === false) {
        return '';
      }
      return String(value);
    }
    
    // Use parent implementation for all other fields
    return super.transformStyleValue(fieldKey, value, field);
  }

  /**
   * Renders live preview of installment plans component
   */
  renderPreview(config: WidgetConfig): TemplateResult {
    const inlineStyles = this.generateDirectStyles(config);

    const showTimeline = config.showTimeline || false;
    const layoutValue = config.installmentLayout || '';

    return html`
      <unzer-installments-widget
        locale="${config.locale || 'en'}"
        public-key="${config.publicKey || ''}"
        amount="${config.amount}"
        currency="${config.currency}"
        country="${config.country}"
        customer-type="${config.customerType}"
        installment-layout="${layoutValue}"
        info-button-layout="${config.infoButtonLayout ?? 'icon'}"
        unzer-logo-display="${config.unzerLogoDisplay ?? 'unzer-logo'}"
        unzer-logo-position="${config.unzerLogoPosition ?? 'right'}"
        .showTimeline="${showTimeline}"
        .showBorder="${config.showBorder !== false}"
        .demo="${config.demo || false}"
        .previewMode="${config.previewMode !== false}"
        info-link-text="${config.infoLinkText ?? ''}"
        style="${inlineStyles}"
      >
      </unzer-installments-widget>
    `;
  }

  /**
   * Renders configuration interface for installment widget customization
   */
  renderConfiguration(config: WidgetConfig): TemplateResult {
    // Create a unique key to force re-render when config changes
    const configKey = JSON.stringify(config);
    return html`
      <unzer-schema-config
        locale="${config.locale || 'en'}"
        .schema="${INSTALLMENT_CONFIG_SCHEMA}"
        .config="${config}"
        key="${configKey}">
      </unzer-schema-config>
    `;
  }

  /**
   * Generates HTML code for installment component integration
   */
  generateCode(_config: WidgetConfig): string {
    return CodePreviewTemplate.generateCode(_config);
  }


  /**
   * Provides data table functionality for installment configuration management
   */
  getTableProvider(): IWidgetTableProvider<unknown> {
    return new DefaultTableProvider(IConfigurationController) as IWidgetTableProvider<unknown>;
  }

}
