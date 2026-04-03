import { html, CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UnzerElement } from '@unzer/messaging-core';
import { cssText } from '@unzer/messaging-core';
import infoButtonStylesContent from './styles/info-button.css?inline';

/**
 * @summary Info button component for invoice widget
 * @fires info-click - Fired when info button is clicked
 */
@customElement('unzer-invoice-info-button')
export class UnzerInvoiceInfoButton extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cssText(infoButtonStylesContent)
    ];
  }

  /** Display variant: circular icon button or text link */
  @property({ type: String })
  variant: 'button' | 'text' | 'icon' | 'link' = 'button';

  /** Custom link text (overrides translation when set) */
  @property({ type: String, attribute: 'link-text' })
  linkText = '';

  private handleClick() {
    this.emit('info-click', { source: 'info-button' });
  }

  render() {
    if (this.variant === 'text' || this.variant === 'link') {
      return html`
        <a
          class="info-link"
          href="javascript:void(0)"
          @click="${this.handleClick}"
          role="button"
          aria-label="${this.t('invoice.info.showDetails')}"
        >
          ${this.linkText || this.t('invoice.info.learnMore')}
        </a>
      `;
    }

    return html`
      <button
        class="info-button"
        @click="${this.handleClick}"
        title="${this.t('invoice.info.showDetails')}"
        aria-label="${this.t('invoice.info.showDetails')}"
      >
        &#8505;
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-invoice-info-button': UnzerInvoiceInfoButton;
  }
}
