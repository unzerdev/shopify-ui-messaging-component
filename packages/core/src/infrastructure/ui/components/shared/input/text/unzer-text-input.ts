import { html, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { classMap } from 'lit/directives/class-map.js';
import { UnzerBaseInput } from '../base/unzer-base-input.js';
import { cssText } from '../../../../utils/css-utils.js';
import textInputStylesContent from '../styles/text-input.css?inline';
import '../../button/unzer-button.js';

/**
 * @summary Text-based input component
 * @description
 * Handles text-based input types: text, email, password, url, tel, search, number
 * Includes password visibility toggle and enhanced validation.
 *
 * @example
 * ```html
 * <unzer-text-input
 *   type="email"
 *   label="Email Address"
 *   required
 *   clearable>
 * </unzer-text-input>
 *
 * <unzer-text-input
 *   type="password"
 *   label="Password"
 *   show-password-toggle>
 * </unzer-text-input>
 * ```
 */
@customElement('unzer-text-input')
export class UnzerTextInput extends UnzerBaseInput {
  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cssText(textInputStylesContent)
    ];
  }
  /** Input type */
  @property({ type: String })
  type: 'text' | 'email' | 'password' | 'url' | 'tel' | 'search' | 'number' = 'text';

  /** Step for number inputs */
  @property({ type: String })
  step = '';

  /** Min value for number inputs */
  @property({ type: String })
  min = '';

  /** Max value for number inputs */
  @property({ type: String })
  max = '';

  /** Show password visibility toggle for password inputs */
  @property({ type: Boolean, attribute: 'show-password-toggle' })
  showPasswordToggle = false;

  @state()
  private isPasswordVisible = false;

  protected getInputType(): string {
    return this.type;
  }

  private togglePasswordVisibility = () => {
    this.isPasswordVisible = !this.isPasswordVisible;
  };

  protected getInputClasses() {
    return {
      ...super.getInputClasses(),
      'input--text': this.type === 'text',
      'input--email': this.type === 'email',
      'input--password': this.type === 'password',
      'input--url': this.type === 'url',
      'input--tel': this.type === 'tel',
      'input--search': this.type === 'search',
      'input--number': this.type === 'number',
    };
  }

  protected getContainerClasses() {
    return {
      ...super.getContainerClasses(),
      'input-container--text': this.type !== 'number',
      'input-container--number': this.type === 'number',
    };
  }

  protected renderActions() {
    const actions = [];

    // Clear button
    if (this.clearable && this.value && !this.disabled && !this.readonly) {
      actions.push(html`
        <unzer-button
          type="button"
          variant="ghost"
          size="small"
          icon-only
          @button-click="${this.handleClear}"
          title="${this.t('shared.textInput.clear')}"
        >
          <svg slot="default" viewBox="0 0 24 24">
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            />
          </svg>
        </unzer-button>
      `);
    }

    // Password visibility toggle
    if (this.type === 'password' && this.showPasswordToggle) {
      actions.push(html`
        <unzer-button
          type="button"
          variant="ghost"
          size="small"
          icon-only
          @button-click="${this.togglePasswordVisibility}"
          title="${this.isPasswordVisible ? this.t('shared.textInput.hidePassword') : this.t('shared.textInput.showPassword')}"
        >
          <svg slot="default" viewBox="0 0 24 24">
            ${this.isPasswordVisible
              ? html`
                  <path
                    d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"
                  />
                `
              : html`
                  <path
                    d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.37,7 12,7Z"
                  />
                `}
          </svg>
        </unzer-button>
      `);
    }

    return actions.length > 0 ? html`<div class="input-actions">${actions}</div>` : '';
  }

  protected renderInput() {
    const inputType = this.type === 'password' && this.isPasswordVisible ? 'text' : this.type;

    return html`
      <input
        id="input"
        class="${classMap(this.getInputClasses())}"
        type="${inputType}"
        name="${ifDefined(this.name || undefined)}"
        placeholder="${ifDefined(this.placeholder || undefined)}"
        .value="${this.value}"
        ?disabled="${this.disabled}"
        ?readonly="${this.readonly}"
        ?required="${this.required}"
        maxlength="${this.maxLength || ''}"
        minlength="${this.minLength || ''}"
        pattern="${this.pattern}"
        autocomplete="${this.autocomplete}"
        step="${this.step}"
        min="${this.min}"
        max="${this.max}"
        @input="${this.handleInput}"
        @change="${this.handleChange}"
        @focus="${this.handleFocus}"
        @blur="${this.handleBlur}"
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-text-input': UnzerTextInput;
  }
}
