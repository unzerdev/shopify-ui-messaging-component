import { html, CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UnzerElement } from '../../../base/unzer-element.js';
import { cssText } from '../../../utils/css-utils.js';
import cardStylesContent from './styles/unzer-card.css?inline';

/**
 * @summary Reusable card component with consistent style design
 * @description
 * A flexible card container with consistent shadow, border, and spacing.
 * Supports different variants, sizes, and interactive states.
 *
 * @example
 * ```html
 * <unzer-card variant="elevated" padding="large">
 *   <h3 slot="header">Card Title</h3>
 *   <p slot="header-description">Optional description</p>
 *   <div>Card content goes here</div>
 *   <div slot="footer">Footer content</div>
 * </unzer-card>
 * ```
 *
 * @slot header - Header content (title, actions)
 * @slot header-description - Optional header description
 * @slot default - Main card content
 * @slot footer - Footer content (buttons, links)
 */
@customElement('unzer-card')
export class UnzerCard extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cssText(cardStylesContent)
    ];
  }

  /**
   * Visual variant of the card
   */
  @property({ type: String, reflect: true })
  variant: 'flat' | 'outlined' | 'elevated' | 'floating' = 'elevated';

  /**
   * Padding size for card content
   */
  @property({ type: String, reflect: true })
  padding: 'none' | 'small' | 'medium' | 'large' = 'medium';

  /**
   * Whether the card is interactive (clickable)
   */
  @property({ type: Boolean, reflect: true })
  interactive = false;

  /**
   * Whether the card is disabled
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Whether the card is in loading state
   */
  @property({ type: Boolean, reflect: true })
  loading = false;

  private hasHeaderSlot = false;
  private hasHeaderDescriptionSlot = false;
  private hasFooterSlot = false;

  connectedCallback() {
    super.connectedCallback();
    this.updateSlotInfo();

    if (this.interactive) {
      this.setAttribute('tabindex', '0');
      this.addEventListener('keydown', this.handleKeyDown);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (this.interactive && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.click();
    }
  };

  private updateSlotInfo() {
    this.hasHeaderSlot = this.querySelector('[slot="header"]') !== null;
    this.hasHeaderDescriptionSlot = this.querySelector('[slot="header-description"]') !== null;
    this.hasFooterSlot = this.querySelector('[slot="footer"]') !== null;
    this.requestUpdate();
  }

  render() {
    const hasHeader = this.hasHeaderSlot || this.hasHeaderDescriptionSlot;
    const hasFooter = this.hasFooterSlot;

    return html`
      <div class="card ${this.variant}">
        ${hasHeader
          ? html`
              <div class="card-header ${hasHeader ? 'has-content' : ''}">
                <div class="header-content">
                  <div class="header-main">
                    <slot name="header"></slot>
                    <slot name="header-description"></slot>
                  </div>
                  <div class="header-actions">
                    <slot name="header-actions"></slot>
                  </div>
                </div>
              </div>
            `
          : ''}

        <div
          class="card-content ${!hasHeader ? 'no-header' : 'has-header'} ${!hasFooter
            ? 'no-footer'
            : 'has-footer'}"
        >
          <slot></slot>
        </div>

        ${hasFooter
          ? html`
              <div class="card-footer ${hasFooter ? 'has-content' : ''}">
                <slot name="footer"></slot>
              </div>
            `
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-card': UnzerCard;
  }
}
