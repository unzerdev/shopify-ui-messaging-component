import { html, CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UnzerElement } from '@unzer/messaging-core';
import { cssText } from '@unzer/messaging-core';
import { formatCurrency } from '../../../utils/currency-formatter.js';
import type { InstallmentPlanDto } from '../../../application/dto';
import planDetailStylesContent from './styles/plan-detail.css?inline';
import { installmentVariablesStyles } from '../../../styling/shared-styles.js';

/**
 * @summary Plan detail component for installment plans
 * @description Displays plan information with configurable layout and styling
 */
@customElement('unzer-plan-detail')
export class UnzerPlanDetail extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      ...(super.styles instanceof Array ? super.styles : [super.styles]),
      installmentVariablesStyles,
      cssText(planDetailStylesContent)
    ];
  }

  /** The installment plan data */
  @property({ type: Object })
  plan?: InstallmentPlanDto;

  /** Currency code for formatting */
  @property({ type: String })
  currency = 'EUR';

  /** Layout style: horizontal, vertical, or compact */
  @property({ type: String })
  layout: 'horizontal' | 'vertical' | 'compact' = 'horizontal';

  /** Whether to show detailed information */
  @property({ type: Boolean, attribute: 'show-details' })
  showDetails = false;

  /** Whether the plan is clickable */
  @property({ type: Boolean })
  clickable = false;

  /** Style configuration object for theming */
  @property({ type: Object })
  styleConfig?: Record<string, unknown>;

  private formatCurrency(amount: string | number): string {
    return formatCurrency(amount, this.currency);
  }

  formatPercentage(rate: number): string {
    return `${rate.toFixed(2)}%`;
  }

  /**
   * Calculate monthly payment amount
   */
  getMonthlyPayment(): number {
    if (!this.plan) return 0;
    return parseFloat(this.plan.totalAmount) / this.plan.numberOfRates;
  }

  private handleClick() {
    if (this.clickable) {
      this.emit('plan-select', { plan: this.plan });
    }
  }


  render() {
    if (!this.plan) {
      return html`<div class="no-plan">${this.t('installments.plan.noPlanData')}</div>`;
    }

    const monthlyAmount = this.getMonthlyPayment();

    return html`
      <div
        class="plan-detail ${this.layout} ${this.clickable ? 'clickable' : ''}"
        @click="${this.handleClick}"
      >
        <!-- Main payment information -->
        <div class="payment-info">
          <div class="monthly-payment">
            <span class="amount">${this.formatCurrency(monthlyAmount)}</span>
            <span class="frequency">${this.t('installments.details.perMonth')}</span>
          </div>
          <div class="installment-count">${this.plan.numberOfRates}\u00A0${this.t('installments.details.perMonth')}</div>
        </div>

        <!-- Detailed information -->
        ${this.showDetails && this.layout !== 'compact'
          ? html`
              <div class="detail-info">
                <div class="detail-row">
                  <span class="label">${this.t('installments.plan.totalAmount')}</span>
                  <span class="value">${this.formatCurrency(this.plan.totalAmount)}</span>
                </div>
                <div class="detail-row">
                  <span class="label">${this.t('installments.plan.interestAmount')}</span>
                  <span class="value">${this.formatCurrency(this.plan.interestAmount)}</span>
                </div>
                <div class="detail-row">
                  <span class="label">${this.t('installments.plan.effectiveRate')}</span>
                  <span class="value"
                    >${this.formatPercentage(this.plan.effectiveInterestRate)}</span
                  >
                </div>
                ${this.layout === 'vertical'
                  ? html`
                      <div class="detail-row">
                        <span class="label">${this.t('installments.plan.nominalRate')}</span>
                        <span class="value"
                          >${this.formatPercentage(this.plan.nominalInterestRate)}</span
                        >
                      </div>
                      <div class="detail-row">
                        <span class="label">${this.t('installments.plan.minFee')}</span>
                        <span class="value"
                          >${this.formatCurrency(this.plan.minimumInstallmentFee)}</span
                        >
                      </div>
                    `
                  : ''}
              </div>
            `
          : ''}

        <!-- Compact mode summary -->
        ${this.layout === 'compact'
          ? html`
              <div class="compact-info">
                <span class="effective-rate"
                  >${this.formatPercentage(this.plan.effectiveInterestRate)}${this.t('installments.plan.apr')}</span
                >
              </div>
            `
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-plan-detail': UnzerPlanDetail;
  }
}