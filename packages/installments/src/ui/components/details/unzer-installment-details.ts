import { html, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { UnzerElement } from '@unzer/messaging-core';
import { cssText } from '@unzer/messaging-core';
import { formatCurrency } from '../../../utils/currency-formatter.js';
import type { InstallmentPlanDto } from '../../../application/dto';
import installmentDetailsStylesContent from './styles/installment-details.css?inline';
import { installmentVariablesStyles } from '../../../styling/shared-styles.js';
import '../unzer-logo/unzer-logo.js';
import '../timeline/unzer-payment-timeline.js';

/**
 * @summary Installment plan details content
 * @description
 * Displays installment plan information including:
 * - Branded header with Unzer logo
 * - Plan selection dropdown
 * - Summary card with monthly payment, interest rate, installment count, and total
 * - Optional payment timeline
 * - Slot for parent-injected content
 *
 * Designed to be used standalone or within unzer-modal.
 *
 * @example
 * ```html
 * <unzer-installment-details
 *   .plans="${plans}"
 *   .selectedPlan="${selectedPlan}"
 *   .amount="${217.3}"
 *   currency="EUR">
 * </unzer-installment-details>
 * ```
 *
 * @slot - Default slot for parent-injected content between header and summary
 * @fires plan-change - Emitted when user selects different plan
 * @fires close-request - Emitted when the close button is clicked
 */
@customElement('unzer-installment-details')
export class UnzerInstallmentDetails extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      super.styles,
      installmentVariablesStyles,
      cssText(installmentDetailsStylesContent)
    ];
  }

  /**
   * All available installment plans for selection
   * @required
   */
  @property({ type: Array })
  plans: InstallmentPlanDto[] = [];

  /**
   * Currently selected plan to display details for
   * @required
   */
  @property({ type: Object })
  selectedPlan: InstallmentPlanDto | null = null;

  /**
   * Original purchase amount
   * @default 0
   */
  @property({ type: Number })
  amount = 0;

  /**
   * Currency code (ISO 4217)
   * @default 'EUR'
   */
  @property({ type: String })
  currency = 'EUR';

  /**
   * Whether to show the payment timeline
   * @default false
   */
  @property({ type: Boolean, attribute: 'show-timeline' })
  showTimeline = false;

  /** Logo display variant matching the widget configuration */
  @property({ type: String, attribute: 'unzer-logo-display' })
  unzerLogoDisplay: string = 'icon';

  @state()
  private dropdownOpen = false;

  private boundCloseDropdown = this.closeDropdownOnOutsideClick.bind(this);

  private toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      document.addEventListener('click', this.boundCloseDropdown);
    } else {
      document.removeEventListener('click', this.boundCloseDropdown);
    }
  }

  private closeDropdownOnOutsideClick(e: Event) {
    const path = e.composedPath();
    const dropdown = this.shadowRoot?.querySelector('.field-box--select');
    if (dropdown && !path.includes(dropdown)) {
      this.dropdownOpen = false;
      document.removeEventListener('click', this.boundCloseDropdown);
    }
  }

  private selectPlan(index: number) {
    const newPlan = this.plans[index];
    if (newPlan) {
      this.selectedPlan = newPlan;
      this.dropdownOpen = false;
      document.removeEventListener('click', this.boundCloseDropdown);
      this.emit('plan-change', {
        plan: newPlan,
        index,
      });
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this.boundCloseDropdown);
    this.dropdownOpen = false;
  }

  private getPaymentDates(): string[] {
    if (!this.selectedPlan) return [];

    const dates = [];
    const numberOfRates = this.selectedPlan.numberOfRates;
    const today = new Date();

    // First payment is today
    dates.push(today.toISOString());

    // Subsequent payments are monthly
    for (let i = 1; i < numberOfRates; i++) {
      const nextDate = new Date(today);
      nextDate.setMonth(today.getMonth() + i);
      dates.push(nextDate.toISOString());
    }

    return dates;
  }

  private handleCloseRequest() {
    this.emit('close-request');
  }

  private renderBenefitIcon() {
    return html`
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="11" cy="11" r="11" fill="#4CAF50"/>
        <path d="M6 11L9.5 14.5L16 8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }

  render() {
    if (!this.selectedPlan) {
      return html`<div class="empty-state">${this.t('installments.details.noSelectedPlan')}</div>`;
    }

    const monthlyAmount = parseFloat(this.selectedPlan.totalAmount) / this.selectedPlan.numberOfRates;
    const formattedMonthly = formatCurrency(monthlyAmount, this.currency);
    const formattedTotal = formatCurrency(this.selectedPlan.totalAmount, this.currency);
    const formattedAmount = formatCurrency(this.amount, this.currency);
    const rate = this.selectedPlan.effectiveInterestRate.toFixed(2);
    const paymentDates = this.getPaymentDates();

    return html`
      <div class="installment-details">
        <!-- 1. Header -->
        <header class="details-header">
          <div class="header-left">
            <span class="header-title">${this.t('installments.details.title')}</span>
          </div>
          <button
            class="close-button"
            @click="${this.handleCloseRequest}"
            aria-label="${this.t('installments.details.close')}"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </header>

        <!-- 2. Description -->
        <p class="description">
          ${this.t('installments.details.description')}
        </p>

        <!-- 2b. Details -->
        <div class="benefits-section">
          <h3 class="benefits-title">${this.t('installments.details.detailsTitle')}</h3>
          <ul class="benefits-list">
            <li class="benefit-item">
              <span class="benefit-icon">${this.renderBenefitIcon()}</span>
              <span class="benefit-text">${this.t('installments.details.benefit1')}</span>
            </li>
            <li class="benefit-item">
              <span class="benefit-icon">${this.renderBenefitIcon()}</span>
              <span class="benefit-text">${this.t('installments.details.benefit2')}</span>
            </li>
            <li class="benefit-item">
              <span class="benefit-icon">${this.renderBenefitIcon()}</span>
              <span class="benefit-text">${this.t('installments.details.benefit3')}</span>
            </li>
          </ul>
        </div>

        <!-- 3. Purchase Amount -->
        <div class="field-row">
          <span class="field-label">${this.t('installments.details.purchaseLabel')}</span>
          <div class="field-box">
            <span class="field-box-label">${this.t('installments.details.purchaseAmount')}</span>
            <span class="field-box-value">${formattedAmount}</span>
          </div>
        </div>

        <!-- 4. Installments Selector -->
        <div class="field-row">
          <span class="field-label">${this.t('installments.details.installmentsLabel')}</span>
          <div
            class="field-box field-box--select ${this.dropdownOpen ? 'open' : ''}"
            @click="${this.toggleDropdown}"
          >
            <span class="field-box-label">${this.t('installments.details.installments')}</span>
            <span class="field-box-value">${this.selectedPlan.numberOfRates}</span>
            <svg class="field-box-chevron" width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L7 7L13 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            ${this.dropdownOpen
              ? html`
                  <div class="dropdown-list">
                    ${this.plans.map(
                      (plan, index) => html`
                        <div
                          class="dropdown-option ${plan === this.selectedPlan ? 'selected' : ''}"
                          @click="${(e: Event) => { e.stopPropagation(); this.selectPlan(index); }}"
                        >
                          ${plan.numberOfRates}
                        </div>
                      `
                    )}
                  </div>
                `
              : ''}
          </div>
        </div>

        <!-- 5. Summary Card -->
        <div class="summary-card">
          <div class="summary-left">
            <div class="monthly-amount">
              <span class="amount">${formattedMonthly}</span>
              <span class="frequency">${this.t('installments.details.perMonth')}</span>
            </div>
            <div class="interest-rate">${this.t('installments.details.interestRate')}${rate}%</div>
          </div>
          <div class="summary-right">
            <div class="installment-count">${this.selectedPlan.numberOfRates}\u00A0${this.t('installments.details.perMonth')}</div>
            <div class="total-amount">${this.t('installments.details.total')}${formattedTotal}</div>
          </div>
        </div>

        <!-- 6. Payment Timeline -->
        ${this.showTimeline ? html`
          <section class="timeline-section">
            <unzer-payment-timeline locale="${this.locale}" .paymentDates="${paymentDates}"></unzer-payment-timeline>
          </section>
        ` : ''}

      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-installment-details': UnzerInstallmentDetails;
  }
}
