import { html, CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ConfigObject } from '@unzer/messaging-core';
import { UnzerElement } from '@unzer/messaging-core';
import { cssText } from '@unzer/messaging-core';
import { logger } from '@unzer/messaging-core';
import installmentRateStylesContent from './styles/installment-rate.css?inline';
import { installmentVariablesStyles } from '../../../styling/shared-styles.js';

/**
 * @summary Displays a single installment rate with date and amount
 * @documentation Unzer Installment Rate Component
 * @status stable
 * @since 1.0
 */
@customElement('unzer-installment-rate')
export class UnzerInstallmentRate extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      ...(super.styles instanceof Array ? super.styles : [super.styles]),
      installmentVariablesStyles,
      cssText(installmentRateStylesContent)
    ];
  }

  /** The installment rate data */
  @property({ type: Object })
  rate?: { date: string; rate: string };

  /** The currency to display */
  @property({ type: String })
  currency = 'EUR';

  /** Custom CSS configuration for styling (JSON string when used as attribute) */
  @property({
    type: Object,
    converter: {
      fromAttribute: (value: string | null): ConfigObject => {
        if (!value) return {};
        try {
          return JSON.parse(value);
        } catch {
          logger.warn('Invalid CSS config JSON', 'UnzerInstallmentRate', { value });
          return {};
        }
      },
      toAttribute: (value: ConfigObject): string => {
        return JSON.stringify(value);
      }
    }
  })
  cssConfig: ConfigObject = {};

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }

  private formatAmount(amount: string): string {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 2,
    }).format(num);
  }

  render() {
    if (!this.rate) {
      return html``;
    }

    return html`
      <div class="rate-item">
        <span class="rate-date">${this.formatDate(this.rate.date)}</span>
        <span class="rate-amount">${this.formatAmount(this.rate.rate)}</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-installment-rate': UnzerInstallmentRate;
  }
}