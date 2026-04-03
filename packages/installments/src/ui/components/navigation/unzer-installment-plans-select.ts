import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { BaseNavigation } from './base-navigation.js';
// ⚡ No CSS config types needed - CSS Variables handle everything
import type { InstallmentPlanDto } from '../../../application/dto/index.js';
// import { logger } from '@unzer/messaging-core'; // Currently unused

export interface PlanSelectEvent {
  selectedIndex: number;
  plan: InstallmentPlanDto;
  source: 'dropdown' | 'info-button';
}

/**
 * @summary Select dropdown component for installment plan selection
 * @documentation Display installment plans in a dropdown format with amount display
 *
 * @example
 * ```html
 * <unzer-installment-plans-select
 *   .plans="${plans}"
 *   .selectedIndex="${0}"
 *   amount="500"
 *   currency="EUR"
 *   @plan-select="${handlePlanSelect}">
 * </unzer-installment-plans-select>
 * ```
 *
 * @fires plan-select - Fired when a plan is selected
 * @csspart container - The main container
 * @csspart amount-label - The amount display label
 * @csspart dropdown - The select dropdown
 * @csspart info-button - The info button
 */
@customElement('unzer-installment-plans-select')
export class UnzerInstallmentPlansSelect extends BaseNavigation {
  /** Currently selected plan index (alias for currentIndex) */
  @property({ type: Number, attribute: 'selected-index' })
  get selectedIndex() {
    return this.currentIndex;
  }
  set selectedIndex(value: number) {
    this.currentIndex = value;
  }

  // ⚡ NO STYLE PROPERTIES! CSS Variables from parent handle all styling

  /**
   * Get the navigation source identifier
   */
  protected getNavigationSource(): string {
    return 'select-navigation';
  }

  // ⚡ No JavaScript CSS variable manipulation - pure CSS approach!
  private handleDropdownChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const newIndex = parseInt(select.value, 10);

    if (this.plans[newIndex]) {
      this.currentIndex = newIndex;
      this.emitNavigationEvent({
        selectedIndex: newIndex,
        plan: this.plans[newIndex],
        index: newIndex,
        direction: 'select',
        source: 'dropdown',
      });
    }
  }

  /**
   * Render the select display content
   */
  protected renderContent() {
    // ⚡ No style calculation needed - CSS Variables handle everything!

    return html`
      <div part="container" class="container">
        <select
          part="dropdown"
          class="dropdown"
          .value="${this.currentIndex}"
          @change="${this.handleDropdownChange}"
        >
          ${this.plans.map(
            (plan, index) => html`
              <option
                value="${index}"
                ?selected="${index === this.currentIndex}"
              >
                ${this.tParams('installments.navigation.months', { count: String(plan.numberOfRates) })}
              </option>
            `
          )}
        </select>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-installment-plans-select': UnzerInstallmentPlansSelect;
  }
}
