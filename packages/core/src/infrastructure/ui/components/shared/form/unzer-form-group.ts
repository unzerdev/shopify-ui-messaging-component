import { html, CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UnzerElement } from '../../../base/unzer-element.js';
import { cssText } from '../../../utils/css-utils.js';
import formGroupStylesContent from './styles/unzer-form-group.css?inline';

/**
 * @summary Reusable form group component with consistent styling
 * @description
 * A standardized form group that includes label, input wrapper, and styling.
 * Provides consistent spacing, focus states, and accessibility features.
 *
 * @example
 * ```html
 * <unzer-form-group label="Amount" required>
 *   <unzer-text-input type="number" step="0.01" value="100.00"></unzer-text-input>
 * </unzer-form-group>
 * ```
 *
 * @slot default - Content to be displayed in the form group (typically input/select)
 */
@customElement('unzer-form-group')
export class UnzerFormGroup extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      ...(super.styles instanceof Array ? super.styles : [super.styles]),
      cssText(formGroupStylesContent)
    ];
  }

  /**
   * Label text for the form group
   */
  @property({ type: String })
  label = '';

  /**
   * Helper text displayed below the input
   */
  @property({ type: String, attribute: 'helper-text' })
  helperText = '';

  /**
   * Error text displayed below the input
   */
  @property({ type: String, attribute: 'error-text' })
  errorText = '';

  /**
   * Whether the field is required
   */
  @property({ type: Boolean })
  required = false;

  /**
   * Whether the field has an error state
   */
  @property({ type: Boolean, reflect: true })
  error = false;

  render() {
    return html`
      ${this.label
        ? html`
            <label class="label">
              ${this.label} ${this.required ? html`<span class="required">*</span>` : ''}
            </label>
          `
        : ''}

      <slot></slot>

      ${this.errorText
        ? html` <div class="error-text">${this.errorText}</div> `
        : this.helperText
          ? html` <div class="helper-text">${this.helperText}</div> `
          : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-form-group': UnzerFormGroup;
  }
}
