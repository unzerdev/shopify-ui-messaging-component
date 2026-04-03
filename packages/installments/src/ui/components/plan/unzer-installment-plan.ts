import { html, CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UnzerElement } from '@unzer/messaging-core';
import { cssText } from '@unzer/messaging-core';
import type { InstallmentPlanDto } from '../../../application/dto';
import { logger } from '@unzer/messaging-core';
import installmentPlanStylesContent from './styles/installment-plan.css?inline';
import { installmentVariablesStyles } from '../../../styling/shared-styles.js';
import './unzer-plan-detail.js';
import '../rate/unzer-installment-rate.js';

/**
 * @summary Displays a single installment plan with all details
 * @documentation Unzer Installment Plan Component
 * @status stable
 * @since 1.0
 *
 * @event unzer-plan-select - Emitted when the plan is selected
 */
@customElement('unzer-installment-plan')
export class UnzerInstallmentPlan extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      ...(super.styles instanceof Array ? super.styles : [super.styles]),
      installmentVariablesStyles,
      cssText(installmentPlanStylesContent)
    ];
  }

  /** The installment plan data */
  @property({ type: Object })
  plan?: InstallmentPlanDto;

  /** The currency to display */
  @property({ type: String })
  currency = 'EUR';

  /** Custom CSS configuration for styling (JSON string when used as attribute) */
  @property({
    type: Object,
    converter: {
      fromAttribute: (value: string | null): Record<string, unknown> => {
        if (!value) return {};
        try {
          return JSON.parse(value);
        } catch {
          logger.warn('Invalid CSS config JSON', 'UnzerInstallmentPlan', { value });
          return {};
        }
      },
      toAttribute: (value: Record<string, unknown>): string => {
        return JSON.stringify(value);
      },
    },
  })
  cssConfig: Record<string, unknown> = {};

  render() {
    if (!this.plan) {
      return html``;
    }

    return html`
      <div class="plan-card">
        <!-- Plan detail header using the reusable component -->
        <div class="plan-header">
          <unzer-plan-detail
            .plan="${this.plan}"
            currency="${this.currency}"
            layout="vertical"
            show-details
            .styleConfig="${this.cssConfig}"
          >
          </unzer-plan-detail>
        </div>

        <!-- Payment schedule section -->
        <div class="plan-rates">
          <div class="rates-title">${this.t('installments.plan.paymentSchedule')}</div>
          ${this.plan.installmentRates.map(
            rate => html`
              <unzer-installment-rate
                .rate="${rate}"
                .currency="${this.currency}"
                .cssConfig="${this.cssConfig}"
              >
              </unzer-installment-rate>
            `
          )}
        </div>

        <!-- Actions section -->
        <div class="plan-actions">
          <a href="${this.plan.secciUrl}" target="_blank" class="secci-link">
            ${this.t('installments.plan.viewCreditAgreement')}
          </a>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-installment-plan': UnzerInstallmentPlan;
  }
}
