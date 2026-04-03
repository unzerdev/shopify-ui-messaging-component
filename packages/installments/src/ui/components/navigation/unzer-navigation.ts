import { html, CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { cssText } from '@unzer/messaging-core';
import { formatCurrency } from '../../../utils/currency-formatter.js';
import { UnzerElement } from '@unzer/messaging-core';
import type { InstallmentPlanDto } from '../../../application/dto';
import './unzer-installment-plans-arrows.js';
import './unzer-installment-plans-buttons.js';
import './unzer-installment-plans-select.js';
import '../info/unzer-installment-info-button.js';
import '../unzer-logo/unzer-logo.js';
import navigationStylesContent from './styles/navigation.css?inline';
import { installmentVariablesStyles } from '../../../styling/shared-styles.js';

/**
 * @summary Main navigation component for installment plans
 * @description Controls the layout: amount label → plan display type → details → logo
 *
 * @example
 * ```html
 * <unzer-navigation
 *   .plans="${plans}"
 *   .currentIndex="${0}"
 *   currency="EUR"
 *   layout="buttons"
 *   show-info
 *   show-logo>
 * </unzer-navigation>
 * ```
 */
@customElement('unzer-navigation')
export class UnzerNavigation extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      super.styles,
      installmentVariablesStyles,
      cssText(navigationStylesContent)
    ];
  }


  /** Array of installment plans */
  @property({ type: Array })
  plans: InstallmentPlanDto[] = [];

  /** Current selected plan index */
  @property({ type: Number })
  currentIndex = 0;

  /** Currency code for formatting */
  @property({ type: String })
  currency = 'EUR';

  /** Style configuration object for theming via CSS variables */
  @property({ type: Object })
  styleConfig?: Record<string, unknown>;

  /** Layout type: arrows, buttons, select, or text */
  @property({ type: String, attribute: 'installment-layout' })
  installmentLayout: 'buttons' | 'arrows' | 'select' | 'text' | '' = 'buttons';

  /** Whether to show info button */
  @property({ type: Boolean, attribute: 'show-info' })
  showInfo = false;

  /** Info button layout: icon or link */
  @property({ type: String, attribute: 'info-button-layout' })
  infoButtonLayout: 'icon' | 'link' | '' = 'icon';

  /** Custom text for info link */
  @property({ type: String, attribute: 'info-link-text' })
  infoLinkText = '';

  /** Logo display mode */
  @property({ type: String, attribute: 'unzer-logo-display' })
  unzerLogoDisplay: 'unzer-logo' | 'icon' | 'pm-logo' | '' = 'unzer-logo';

  /** Logo position: left or right */
  @property({ type: String, attribute: 'unzer-logo-position' })
  unzerLogoPosition: 'left' | 'right' = 'right';

  /**
   * Format currency amount for display
   */
  private formatCurrency(amount: string | number): string {
    return formatCurrency(amount, this.currency);
  }

  /**
   * Get monthly amount for current plan
   */
  private getMonthlyAmount(): number {
    if (!this.plans?.length || this.currentIndex >= this.plans.length) return 0;

    const currentPlan = this.plans[this.currentIndex];
    return parseFloat(currentPlan.totalAmount) / currentPlan.numberOfRates;
  }

  // ⚡ No JavaScript CSS variable manipulation - pure CSS approach!
  
  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    
    // Apply styleConfig to component
    if (changedProperties.has('styleConfig') && this.styleConfig) {
      if ((this.styleConfig as Record<string, unknown>).fontFamily) {
        this.style.fontFamily = (this.styleConfig as Record<string, unknown>).fontFamily as string;
        this.style.setProperty('--unzer-font-family', (this.styleConfig as Record<string, unknown>).fontFamily as string);
      }
    }
  }


  /**
   * Handle plan navigation events from child components
   */
  private handlePlanNavigate(event: CustomEvent) {
    // Re-emit the event so parent components can listen
    this.emit('plan-navigate', event.detail);
  }

  /**
   * Handle info button click
   */
  private handleInfoClick() {
    if (!this.plans?.length) return;

    this.emit('details-toggle', {
      plan: this.plans[this.currentIndex],
      index: this.currentIndex,
      source: 'info-button',
    });
  }

  /**
   * Render the amount label
   */
  private renderAmountLabel() {
    const monthlyAmount = this.getMonthlyAmount();

    return html`
      <span class="amount-label">${this.formatCurrency(monthlyAmount)}\u00a0${this.t('installments.navigation.monthlyIn')}</span>
    `;
  }

  /**
   * Render the appropriate plan display type based on layout
   */
  private renderPlanDisplay() {
    switch (this.installmentLayout) {
      case 'arrows':
        return html`
          <unzer-installment-plans-arrows
            locale="${this.locale}"
            .plans="${this.plans}"
            .currentIndex="${this.currentIndex}"
            .currency="${this.currency}"
            .styleConfig="${this.styleConfig}"
            @plan-navigate="${this.handlePlanNavigate}"
          >
          </unzer-installment-plans-arrows>
        `;

      case 'select':
        return html`
          <unzer-installment-plans-select
            locale="${this.locale}"
            .plans="${this.plans}"
            .selectedIndex="${this.currentIndex}"
            .currency="${this.currency}"
            .styleConfig="${this.styleConfig}"
            @plan-navigate="${this.handlePlanNavigate}"
          >
          </unzer-installment-plans-select>
        `;

      case 'buttons':
      default:
        return html`
          <unzer-installment-plans-buttons
            locale="${this.locale}"
            .plans="${this.plans}"
            .selectedIndex="${this.currentIndex}"
            .currency="${this.currency}"
            .styleConfig="${this.styleConfig}"
            @plan-navigate="${this.handlePlanNavigate}"
          >
          </unzer-installment-plans-buttons>
        `;
    }
  }

  /**
   * Render the info/details button
   */
  private renderDetails() {
    if (!this.showInfo || !this.infoButtonLayout) return '';

    return html`
      <unzer-installment-info-button
        locale="${this.locale}"
        .variant="${this.infoButtonLayout}"
        .linkText="${this.infoLinkText}"
        @info-click="${this.handleInfoClick}"
      >
      </unzer-installment-info-button>
    `;
  }

  /**
   * Render the text layout: "Pay in X interest-free payments of $Y Learn more"
   */
  private renderTextLayout() {
    const firstPlan = this.plans[0];
    if (!firstPlan) return '';

    const monthlyAmount = parseFloat(firstPlan.totalAmount) / firstPlan.numberOfRates;
    const formattedAmount = this.formatCurrency(monthlyAmount);
    const inlineLearnMore = this.showInfo && !!this.infoButtonLayout && this.infoButtonLayout === 'link';

    return html`
      <span class="text-layout">
        ${this.t('installments.navigation.payIn')}<strong>${firstPlan.numberOfRates}</strong>${this.t('installments.navigation.interestFreePayments')}<strong>${formattedAmount}</strong>${inlineLearnMore
          ? html` <unzer-installment-info-button
              locale="${this.locale}"
              .variant="${'link'}"
              .linkText="${this.infoLinkText}"
              @info-click="${this.handleInfoClick}"
            ></unzer-installment-info-button>`
          : ''}
      </span>
      ${this.showInfo && this.infoButtonLayout === 'icon' ? this.renderDetails() : ''}
      ${this.renderLogo()}
    `;
  }

  /**
   * Render the Unzer logo
   */
  private renderLogo() {
    if (!this.unzerLogoDisplay) return '';

    // Map 'unzer-logo' to 'logo' for the logo sub-component which accepts 'logo' | 'icon' | 'pm-logo'
    const logoVariantValue = this.unzerLogoDisplay === 'unzer-logo' ? 'logo' : this.unzerLogoDisplay;

    return html`
      <unzer-logo .variant="${logoVariantValue}" class="${this.unzerLogoPosition === 'left' ? 'logo-left' : ''}"></unzer-logo>
    `;
  }

  render() {
    if (!this.plans?.length) {
      return html`<div class="empty-state">${this.t('installments.navigation.noPlans')}</div>`;
    }

    const currentPlan = this.plans[this.currentIndex];
    if (!currentPlan) {
      return html`<div class="empty-state">${this.t('installments.navigation.invalidPlan')}</div>`;
    }

    if (this.installmentLayout === 'text') {
      return html`
        <div class="navigation-container">
          ${this.renderTextLayout()}
        </div>
      `;
    }

    return html`
      <div class="navigation-container">
        ${this.renderAmountLabel()}

        <div class="navigation-content">${this.renderPlanDisplay()}</div>

        ${this.renderDetails()} ${this.renderLogo()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-navigation': UnzerNavigation;
  }
}
