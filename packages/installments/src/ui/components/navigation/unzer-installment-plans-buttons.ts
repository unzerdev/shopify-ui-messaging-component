import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { BaseNavigation } from './base-navigation.js';
import type { InstallmentPlanDto } from '../../../application/dto/index.js';

export interface PlanButtonSelectEvent {
  selectedIndex: number;
  plan: InstallmentPlanDto;
  source: 'button-click';
}

/**
 * @summary Buttons layout component for installment plan selection
 * @documentation Display installment plans as clickable buttons with amount display
 *
 * @example
 * ```html
 * <unzer-installment-plans-buttons
 *   .plans="${plans}"
 *   .selectedIndex="${0}"
 *   amount="500"
 *   currency="EUR"
 *   @plan-select="${handlePlanSelect}">
 * </unzer-installment-plans-buttons>
 * ```
 *
 * @fires plan-select - Fired when a plan button is clicked
 * @csspart container - The main container
 * @csspart amount-label - The amount display label
 * @csspart buttons-container - The buttons wrapper
 * @csspart button - Individual plan buttons
 */
@customElement('unzer-installment-plans-buttons')
export class UnzerInstallmentPlansButtons extends BaseNavigation {
  /** Currently selected plan index (alias for currentIndex) */
  @property({ type: Number, attribute: 'selected-index' })
  get selectedIndex() {
    return this.currentIndex;
  }
  set selectedIndex(value: number) {
    this.currentIndex = value;
  }

  /**
   * Get the navigation source identifier
   */
  protected getNavigationSource(): string {
    return 'button-navigation';
  }

  // ⚡ No JavaScript CSS variable manipulation - pure CSS approach!

  private handleButtonClick(index: number) {
    if (this.plans[index]) {
      this.currentIndex = index;
      this.emitNavigationEvent({
        selectedIndex: index,
        plan: this.plans[index],
        index,
        direction: 'select',
        source: 'button-click',
      });
    }
  }

  /**
   * Render the buttons display content
   */
  protected renderContent() {
    // ⚡ No style calculation needed - CSS Variables handle everything!

    return html`
      <div part="container" class="container">
        <div part="buttons-container" class="buttons-container">
          ${this.plans.map(
            (plan, index) => html`
              <button
                part="button"
                class="plan-button ${this.currentIndex === index ? 'selected' : ''}"
                @click="${() => this.handleButtonClick(index)}"
                title="${this.tParams('installments.navigation.selectPlan', { count: String(plan.numberOfRates) })}"
                aria-label="${this.tParams('installments.navigation.selectPlan', { count: String(plan.numberOfRates) })}"
                ?aria-pressed="${this.currentIndex === index}"
              >
                ${plan.numberOfRates}x
              </button>
            `
          )}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-installment-plans-buttons': UnzerInstallmentPlansButtons;
  }
}
