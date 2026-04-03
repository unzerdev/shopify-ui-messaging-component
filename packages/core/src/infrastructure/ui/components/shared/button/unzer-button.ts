import { html, CSSResultGroup } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { UnzerElement } from '../../../base/unzer-element.js';
import { cssText } from '../../../utils/css-utils.js';
import buttonStylesContent from './styles/unzer-button.css?inline';

/**
 * @summary Reusable button component with consistent styling and variants
 * @description
 * A flexible button component that supports multiple variants, sizes, states,
 * and consistent styling with the design system. Supports icons, loading states,
 * and accessibility features.
 *
 * @example
 * ```html
 * <unzer-button
 *   variant="primary"
 *   size="medium"
 *   @button-click="${this.handleClick}">
 *   Save Changes
 * </unzer-button>
 * ```
 *
 * @fires button-click - Emitted when button is clicked
 * @slot default - Button content (text, icons)
 * @slot icon-left - Icon to display on the left side
 * @slot icon-right - Icon to display on the right side
 */
@customElement('unzer-button')
export class UnzerButton extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      ...(super.styles instanceof Array ? super.styles : [super.styles]),
      cssText(buttonStylesContent)
    ];
  }

  /**
   * Button variant/style
   */
  @property({ type: String, reflect: true })
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' =
    'primary';

  /**
   * Button size
   */
  @property({ type: String, reflect: true })
  size: 'small' | 'medium' | 'large' | 'xl' = 'medium';

  /**
   * Whether button is disabled
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Whether button is in loading state
   */
  @property({ type: Boolean, reflect: true })
  loading = false;

  /**
   * Button type for forms
   */
  @property({ type: String })
  type: 'button' | 'submit' | 'reset' = 'button';

  /**
   * Form name attribute
   */
  @property({ type: String })
  name = '';

  /**
   * Form value
   */
  @property({ type: String })
  value = '';

  /**
   * Whether button takes full width
   */
  @property({ type: Boolean, reflect: true, attribute: 'full-width' })
  fullWidth = false;

  /**
   * Whether this is an icon-only button
   */
  @property({ type: Boolean, reflect: true, attribute: 'icon-only' })
  iconOnly = false;

  /**
   * Whether button has rounded corners
   */
  @property({ type: Boolean, reflect: true })
  rounded = false;

  /**
   * Shadow variant
   */
  @property({ type: String, reflect: true })
  shadow: '' | 'small' | 'large' = '';

  /**
   * Badge text/number to display
   */
  @property({ type: String })
  badge = '';

  /**
   * Left icon (SVG string)
   */
  @property({ type: String, attribute: 'icon-left' })
  iconLeft = '';

  /**
   * Right icon (SVG string)
   */
  @property({ type: String, attribute: 'icon-right' })
  iconRight = '';

  @query('.button')
  private buttonElement!: HTMLButtonElement;

  private handleClick = (event: MouseEvent) => {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Dispatch custom event
    this.dispatchEvent(
      new CustomEvent('button-click', {
        detail: {
          name: this.name,
          value: this.value,
          variant: this.variant,
          nativeEvent: event,
        },
        bubbles: true,
      })
    );
  };

  /**
   * Focus the button
   */
  focus() {
    this.buttonElement?.focus();
  }

  /**
   * Blur the button
   */
  blur() {
    this.buttonElement?.blur();
  }

  /**
   * Click the button programmatically
   */
  click() {
    if (!this.disabled && !this.loading) {
      this.buttonElement?.click();
    }
  }

  private renderIcon(iconSvg: string, position: 'left' | 'right') {
    if (!iconSvg) return '';

    return html` <div class="button-icon icon-${position}" .innerHTML="${iconSvg}"></div> `;
  }

  private renderLoadingSpinner() {
    if (!this.loading) return '';

    return html`
      <div class="loading-spinner">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" />
          <path
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            fill="currentColor"
          />
        </svg>
      </div>
    `;
  }

  private renderBadge() {
    if (!this.badge) return '';

    return html`<div class="button-badge">${this.badge}</div>`;
  }

  render() {
    const classes = ['button', this.variant, this.size, this.loading ? 'loading' : '']
      .filter(Boolean)
      .join(' ');

    return html`
      <button
        class="${classes}"
        type="${this.type}"
        name="${this.name}"
        value="${this.value}"
        ?disabled="${this.disabled || this.loading}"
        @click="${this.handleClick}"
      >
        ${this.renderLoadingSpinner()} ${this.renderBadge()}

        <div class="button-content">
          ${this.renderIcon(this.iconLeft, 'left')}
          <slot name="icon-left"></slot>

          <slot></slot>

          ${this.renderIcon(this.iconRight, 'right')}
          <slot name="icon-right"></slot>
        </div>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-button': UnzerButton;
  }
}
