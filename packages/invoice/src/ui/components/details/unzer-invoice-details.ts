import { html, CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UnzerElement } from '@unzer/messaging-core';
import { cssText } from '@unzer/messaging-core';
import invoiceDetailsStylesContent from './styles/invoice-details.css?inline';
import { invoiceVariablesStyles } from '../../../styling/shared-styles.js';
import '../unzer-logo/unzer-invoice-logo.js';

/**
 * @summary Invoice details modal content
 * @description Displays invoice payment information: benefits and next steps.
 * @fires close-request - Emitted when the close button is clicked
 */
@customElement('unzer-invoice-details')
export class UnzerInvoiceDetails extends UnzerElement {
  /** Number of days the customer has to pay */
  @property({ type: Number, attribute: 'expiry-days' })
  expiryDays = 14;

  /** Logo display variant */
  @property({ type: String, attribute: 'unzer-logo-display' })
  unzerLogoDisplay: 'unzer-logo' | 'icon' | 'pm-logo' | '' = 'unzer-logo';

  static get styles(): CSSResultGroup {
    return [
      super.styles,
      invoiceVariablesStyles,
      cssText(invoiceDetailsStylesContent)
    ];
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
    return html`
      <div class="invoice-details">
        <!-- Header -->
        <header class="details-header">
          <div class="header-left">
            <span class="header-title">${this.t('invoice.details.title')}</span>
          </div>
          <button
            class="close-button"
            @click="${this.handleCloseRequest}"
            aria-label="${this.t('invoice.details.close')}"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </header>

        <!-- Description -->
        <p class="description">
          ${this.t('invoice.details.description')}
        </p>

        <!-- Details -->
        <div class="benefits-section">
          <h3 class="benefits-title">${this.t('invoice.details.detailsTitle')}</h3>
          <ul class="benefits-list">
            <li class="benefit-item">
              <span class="benefit-icon">${this.renderBenefitIcon()}</span>
              <span class="benefit-text">${this.tParams('invoice.details.benefit1', { days: String(this.expiryDays) })}</span>
            </li>
            <li class="benefit-item">
              <span class="benefit-icon">${this.renderBenefitIcon()}</span>
              <span class="benefit-text">${this.t('invoice.details.benefit2')}</span>
            </li>
            <li class="benefit-item">
              <span class="benefit-icon">${this.renderBenefitIcon()}</span>
              <span class="benefit-text">${this.t('invoice.details.benefit3')}</span>
            </li>
          </ul>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-invoice-details': UnzerInvoiceDetails;
  }
}
