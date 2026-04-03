import { html, CSSResultGroup } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { classMap } from 'lit/directives/class-map.js';
import { UnzerBaseInput } from '../base/unzer-base-input.js';
import { cssText } from '../../../../utils/css-utils.js';
import colorInputStylesContent from '../styles/color-input.css?inline';

/**
 * @summary Color picker input component
 * @description
 * Specialized color input with enhanced styling and preview.
 *
 * @example
 * ```html
 * <unzer-color-input
 *   label="Primary Color"
 *   .value="#3498db">
 * </unzer-color-input>
 * ```
 */
@customElement('unzer-color-input')
export class UnzerColorInput extends UnzerBaseInput {
  static get styles(): CSSResultGroup {
    return [
      ...(super.styles instanceof Array ? super.styles : [super.styles]),
      cssText(colorInputStylesContent)
    ];
  }

  protected getInputType(): string {
    return 'color';
  }

  protected getInputClasses() {
    return {
      ...super.getInputClasses(),
      'input--color': true,
    };
  }

  protected getContainerClasses() {
    return {
      ...super.getContainerClasses(),
      'input-container--color': true,
    };
  }

  private handleColorInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.handleInput(event);

    // Update text input
    const textInput = this.shadowRoot?.querySelector('.color-text-input') as HTMLInputElement;
    if (textInput) {
      textInput.value = input.value.toUpperCase();
    }
  };

  private handleTextInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    let value = input.value.trim();

    // Add # if missing
    if (value && !value.startsWith('#')) {
      value = '#' + value;
    }

    // Validate hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      this.value = value;

      // Update color input
      const colorInput = this.shadowRoot?.querySelector('.color-picker-input') as HTMLInputElement;
      if (colorInput) {
        colorInput.value = value;
      }

      // Emit change event
      this.handleInput(event);
    }
  };

  protected renderInput() {
    return html`
      <div class="color-input-wrapper">
        <input
          class="color-picker-input ${classMap(this.getInputClasses())}"
          type="color"
          .value="${this.value}"
          ?disabled="${this.disabled}"
          ?readonly="${this.readonly}"
          @input="${this.handleColorInput}"
          @change="${this.handleChange}"
          @focus="${this.handleFocus}"
          @blur="${this.handleBlur}"
        />
        <span class="hex-symbol">#</span>
        <input
          id="input"
          class="color-text-input"
          type="text"
          name="${ifDefined(this.name || undefined)}"
          .value="${this.value.substring(1).toUpperCase()}"
          placeholder="FFFFFF"
          maxlength="6"
          ?disabled="${this.disabled}"
          ?readonly="${this.readonly}"
          ?required="${this.required}"
          @input="${this.handleTextInput}"
          @focus="${this.handleFocus}"
          @blur="${this.handleBlur}"
        />
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-color-input': UnzerColorInput;
  }
}
