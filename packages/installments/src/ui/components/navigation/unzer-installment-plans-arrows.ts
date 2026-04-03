import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseNavigation } from './base-navigation.js';

/**
 * @summary Arrows navigation component for installment plans
 * @description Displays installment plans with arrow navigation (previous/next)
 *
 * @example
 * ```html
 * <unzer-installment-plans-arrows
 *   .plans="${plans}"
 *   .currentIndex="${0}"
 *   @plan-navigate="${handleNavigate}">
 * </unzer-installment-plans-arrows>
 * ```
 *
 * @fires plan-navigate - Fired when navigation occurs
 */
@customElement('unzer-installment-plans-arrows')
export class UnzerInstallmentPlansArrows extends BaseNavigation {

  /**
   * Get the navigation source identifier
   */
  protected getNavigationSource(): string {
    return 'arrow-navigation';
  }

  private navigateToPrevious() {
    if (!this.plans?.length || this.currentIndex <= 0) return;

    const newIndex = this.currentIndex - 1;
    this.currentIndex = newIndex; // Update local index

    this.emitNavigationEvent({
      plan: this.plans[newIndex],
      index: newIndex,
      direction: 'previous',
      source: 'arrow-navigation',
    });
  }

  private navigateToNext() {
    if (!this.plans?.length || this.currentIndex >= this.plans.length - 1) return;

    const newIndex = this.currentIndex + 1;
    this.currentIndex = newIndex; // Update local index

    this.emitNavigationEvent({
      plan: this.plans[newIndex],
      index: newIndex,
      direction: 'next',
      source: 'arrow-navigation',
    });
  }

  /**
   * Render the arrows display content
   */
  protected renderContent() {
    const currentPlan = this.plans[this.currentIndex];

    return html`
      <div class="arrow-navigation">
        <button
          class="arrow-button prev"
          @click="${this.navigateToPrevious}"
          ?disabled="${this.currentIndex <= 0}"
          aria-label="${this.t('installments.navigation.previousPlan')}"
        >
          &#8249;
        </button>

        <div class="plan-info">${this.tParams('installments.details.installmentCount', { count: String(currentPlan.numberOfRates) })}</div>

        <button
          class="arrow-button next"
          @click="${this.navigateToNext}"
          ?disabled="${this.currentIndex >= this.plans.length - 1}"
          aria-label="${this.t('installments.navigation.nextPlan')}"
        >
          &#8250;
        </button>
      </div>
    `;
  }
}
