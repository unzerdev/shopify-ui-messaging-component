import { html, CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { classMap } from 'lit/directives/class-map.js';
import { UnzerBaseInput } from '../base/unzer-base-input.js';
import { cssText } from '../../../../utils/css-utils.js';
import checkboxInputStylesContent from '../styles/checkbox-input.css?inline';

/**
 * @summary Checkbox and radio input component
 * @description
 * Handles checkbox and radio input types with support for radio groups.
 *
 * @example
 * ```html
 * <!-- Checkbox -->
 * <unzer-checkbox-input
 *   type="checkbox"
 *   label="Accept terms"
 *   ?checked="${true}">
 * </unzer-checkbox-input>
 *
 * <!-- Radio group -->
 * <unzer-checkbox-input
 *   type="radio"
 *   name="size"
 *   .options="${[
 *     {value: 'small', label: 'Small'},
 *     {value: 'medium', label: 'Medium'},
 *     {value: 'large', label: 'Large'}
 *   ]}">
 * </unzer-checkbox-input>
 * ```
 */
@customElement('unzer-checkbox-input')
export class UnzerCheckboxInput extends UnzerBaseInput {
  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cssText(checkboxInputStylesContent)
    ];
  }
  /** Input type */
  @property({ type: String })
  type: 'checkbox' | 'radio' = 'checkbox';

  /** Whether checkbox/radio is checked */
  @property({ type: Boolean, reflect: true })
  checked = false;

  /** Options for radio groups */
  @property({ type: Array })
  options: Array<{ value: string; label: string; disabled?: boolean }> = [];
  
  /** Display variant for checkbox (default or toggle) */
  @property({ type: String })
  variant: 'default' | 'toggle' = 'default';

  protected getInputType(): string {
    return this.type;
  }

  protected handleInput = (event: Event) => {
    const input = event.target as HTMLInputElement;

    this.checked = input.checked;
    this.value = input.checked ? input.value || 'on' : '';
    this.error = false; // Clear error on input

    // Emit events
    this.emit('unzer-input', {
      value: this.value,
      checked: this.checked,
      name: this.name,
      type: this.getInputType(),
    });
    this.emit('input-change', {
      value: this.value,
      checked: this.checked,
      name: this.name,
      type: this.getInputType(),
    });
  };
  
  protected handleChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    this.checked = input.checked;
    this.value = input.checked ? input.value || 'on' : '';

    // Emit events with checked property
    this.emit('unzer-change', { 
      value: this.value, 
      checked: this.checked,
      name: this.name 
    });
    this.emit('input-change', { 
      value: this.value, 
      checked: this.checked,
      name: this.name 
    });
  };

  protected getInputClasses() {
    return {
      ...super.getInputClasses(),
      'input--checkbox': this.type === 'checkbox',
      'input--radio': this.type === 'radio',
      'input--toggle': this.variant === 'toggle',
    };
  }

  protected getContainerClasses() {
    return {
      ...super.getContainerClasses(),
      'input-container--checkbox': this.type === 'checkbox',
      'input-container--radio': this.type === 'radio',
    };
  }

  private renderRadioOptions() {
    if (this.type !== 'radio' || this.options.length === 0) return '';

    return this.options.map(
      option => html`
        <label class="radio-option ${classMap({ disabled: option.disabled || false })}">
          <input
            type="radio"
            name="${this.name}"
            value="${option.value}"
            ?checked="${this.value === option.value}"
            ?disabled="${option.disabled || this.disabled}"
            @change="${this.handleInput}"
            class="radio-input"
          />
          <span class="radio-label">${option.label}</span>
        </label>
      `
    );
  }

  private renderCheckboxLabel() {
    if (this.type !== 'checkbox' || !this.label) return '';

    return html` <span class="checkbox-label">${this.label}</span> `;
  }

  protected renderInput() {
    return html`
      <input
        id="input"
        class="${classMap(this.getInputClasses())}"
        type="${this.type}"
        name="${ifDefined(this.name || undefined)}"
        .value="${this.value}"
        ?checked="${this.checked}"
        ?disabled="${this.disabled}"
        ?readonly="${this.readonly}"
        ?required="${this.required}"
        @input="${this.handleInput}"
        @change="${this.handleChange}"
        @focus="${this.handleFocus}"
        @blur="${this.handleBlur}"
      />
      ${this.renderCheckboxLabel()}
    `;
  }

  render() {
    // Special handling for radio group
    if (this.type === 'radio' && this.options.length > 0) {
      return html`
        <div class="input-wrapper radio-group">
          ${this.renderLabel()}
          <div class="radio-options">${this.renderRadioOptions()}</div>
          ${this.renderHelpText()}
        </div>
      `;
    }

    // For checkbox, don't show label above (it's rendered next to input)
    return html`
      <div class="input-wrapper">
        ${this.type === 'checkbox' ? '' : this.renderLabel()}

        <div class="${classMap(this.getContainerClasses())}">
          <div class="input-field-wrapper">${this.renderInput()}</div>
        </div>

        ${this.renderHelpText()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-checkbox-input': UnzerCheckboxInput;
  }
}
