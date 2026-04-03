import { html, CSSResultGroup } from 'lit';
import { property } from 'lit/decorators.js';
import { cssText } from '@unzer/messaging-core';
import { UnzerElement } from '@unzer/messaging-core';
import type { InstallmentPlanDto } from '../../../application/dto';
import '../info/unzer-installment-info-button.js';
import navigationStylesContent from './styles/navigation.css?inline';

export interface NavigationEvent {
  selectedIndex?: number;
  plan: InstallmentPlanDto;
  index: number;
  direction?: 'previous' | 'next' | 'info' | 'select';
  source: string;
}

/**
 * Abstract base class for installment plan display types (arrows, buttons, select)
 * Provides common properties and methods for rendering different plan display types
 * Does NOT control layout - that's handled by unzer-navigation
 */
export abstract class BaseNavigation extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cssText(navigationStylesContent)
    ];
  }
  /** Array of installment plans */
  @property({ type: Array })
  plans: InstallmentPlanDto[] = [];

  /** Currently selected/active plan index */
  @property({ type: Number, attribute: 'current-index' })
  currentIndex = 0;

  /** Currency for formatting */
  @property({ type: String })
  currency = 'EUR';

  // Note: info button and logo are handled by unzer-navigation, not here

  /** Style configuration object for theming */
  @property({ type: Object })
  styleConfig?: Record<string, unknown>;

  connectedCallback() {
    super.connectedCallback();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
  }

  /**
   * Emit navigation event with standardized format
   */
  protected emitNavigationEvent(detail: Partial<NavigationEvent>) {
    const currentPlan = this.plans[this.currentIndex];
    if (!currentPlan) return;

    const event: NavigationEvent = {
      plan: currentPlan,
      index: this.currentIndex,
      source: this.getNavigationSource(),
      ...detail,
    };

    this.emit('plan-navigate', event);
  }

  /**
   * Get the source identifier for this navigation type
   * Should be implemented by child classes
   */
  protected abstract getNavigationSource(): string;

  /**
   * Abstract method that each display type must implement
   * Returns the specific display content (arrows, buttons, select)
   */
  protected abstract renderContent(): unknown;

  /**
   * Main render method - just renders the specific display type content
   */
  render() {
    if (!this.plans?.length) {
      return html`<div class="empty-state">${this.t('installments.navigation.noPlans')}</div>`;
    }

    const currentPlan = this.plans[this.currentIndex];
    if (!currentPlan) {
      return html`<div class="empty-state">${this.t('installments.navigation.invalidPlan')}</div>`;
    }

    return this.renderContent();
  }
}
