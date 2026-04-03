import { html, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { classMap } from 'lit/directives/class-map.js';
import { UnzerBaseInput } from '../base/unzer-base-input.js';
import { cssText } from '../../../../utils/css-utils.js';
import type { BaseConfig } from '../../../../../types/config.types.js';
import rangeInputStylesContent from '../styles/range-input.css?inline';


/**
 * @summary Range slider input component
 * @description
 * Specialized range input with value display and custom styling.
 *
 * @example
 * ```html
 * <!-- Using properties -->
 * <unzer-range-input
 *   label="Volume"
 *   min="0"
 *   max="100"
 *   step="1"
 *   .value="${50}"
 *   show-value>
 * </unzer-range-input>
 *
 * <!-- Using configuration object -->
 * <unzer-range-input
 *   label="Amount"
 *   .config="${{defaultValue: 217.3, min: 0, max: 10000, step: 0.1}}"
 *   .value="${217.3}"
 *   show-value>
 * </unzer-range-input>
 * ```
 */
@customElement('unzer-range-input')
export class UnzerRangeInput extends UnzerBaseInput {
  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cssText(rangeInputStylesContent)
    ];
  }

  /**
   * Get the effective value to use for display and calculation
   */
  private getEffectiveValue(): string {
    // Use provided value if it exists and is not empty
    if (this.value && this.value !== '') {
      return this.value;
    }
    // Fall back to config default value if no value provided
    const configRecord = this.config as Record<string, unknown>;
    if (configRecord?.defaultValue !== undefined && configRecord.defaultValue !== null) {
      return configRecord.defaultValue.toString();
    }
    // Final fallback
    return '0';
  }

  firstUpdated(changedProperties: Map<string | number | symbol, unknown>) {
    super.firstUpdated(changedProperties);
    // If no value is set but we have a config default, use it
    const configRecord = this.config as Record<string, unknown>;
    if ((!this.value || this.value === '') && configRecord?.defaultValue !== undefined) {
      // Schedule this for next tick to avoid update-during-update
      setTimeout(() => {
        this.value = (configRecord.defaultValue ?? '').toString();
      }, 0);
    }
  }

  /** Configuration for range input (min, max, step, default) */
  @property({ type: Object })
  config?: BaseConfig;

  /** Step for range input */
  @property({ type: String })
  step = '1';

  /** Min value for range input */
  @property({ type: String })
  min = '0';

  /** Max value for range input */
  @property({ type: String })
  max = '100';

  /** Show current value next to slider */
  @property({ type: Boolean, attribute: 'show-value' })
  showValue = false;

  /** Show value tooltip on thumb click */
  @property({ type: Boolean, attribute: 'show-tooltip' })
  showTooltip = true;

  @state()
  private showValueTooltip = false;

  /**
   * Get effective min value (config -> property -> default)
   */
  private getEffectiveMin(): string {
    return (this.config as Record<string, unknown>)?.min?.toString() || this.min || '0';
  }

  /**
   * Get effective max value (config -> property -> default)
   */
  private getEffectiveMax(): string {
    return (this.config as Record<string, unknown>)?.max?.toString() || this.max || '100';
  }

  /**
   * Get effective step value (config -> property -> default)
   */
  private getEffectiveStep(): string {
    return (this.config as Record<string, unknown>)?.step?.toString() || this.step || '1';
  }

  protected getInputType(): string {
    return 'range';
  }

  protected handleInput = (event: Event): void => {
    // When user interacts with the input, update our value
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.value = inputElement.value;
    }

    // Clear error on input
    this.error = false;

    // Emit events like the base class does
    this.emit('unzer-input', {
      value: this.value,
      name: this.name,
      type: this.getInputType(),
    });
    this.emit('input-change', {
      value: this.value,
      name: this.name,
      type: this.getInputType(),
    });

    // Show tooltip when dragging
    if (this.showTooltip) {
      this.showValueTooltip = true;
      // Hide tooltip after 2 seconds
      setTimeout(() => {
        this.showValueTooltip = false;
      }, 2000);
    }
  };

  private handleClick = (event: MouseEvent) => {
    if (!this.showTooltip) return;

    event.preventDefault();
    event.stopPropagation();

    // Show tooltip on any click
    this.showValueTooltip = !this.showValueTooltip;

    // Auto-hide after 3 seconds
    if (this.showValueTooltip) {
      setTimeout(() => {
        this.showValueTooltip = false;
        this.requestUpdate();
      }, 3000);
    }
  };

  protected getInputClasses() {
    return {
      ...super.getInputClasses(),
      'input--range': true,
    };
  }

  protected getContainerClasses() {
    return {
      ...super.getContainerClasses(),
      'input-container--range': true,
    };
  }

  private renderRangeValue() {
    if (!this.showValue) return '';

    return html` <span class="range-value">${this.getEffectiveValue()}</span> `;
  }

  private renderTooltip(progress: number) {
    if (!this.showValueTooltip) return html``;

    return html`
      <div class="value-tooltip" style="left: ${progress}%">${this.getEffectiveValue()}</div>
    `;
  }

  protected renderInput() {
    // Get the effective value to use
    const effectiveValue = this.getEffectiveValue();

    // Calculate progress percentage for gradient fill using effective values
    const numValue = Number(effectiveValue) || 0;
    const numMin = Number(this.getEffectiveMin()) || 0;
    const numMax = Number(this.getEffectiveMax()) || 100;

    // Ensure progress is between 0 and 100
    let progress = ((numValue - numMin) / (numMax - numMin)) * 100;
    progress = Math.max(0, Math.min(100, progress));

    // Debug removed

    return html`
      <div class="range-wrapper">
        <input
          id="input"
          class="${classMap(this.getInputClasses())}"
          type="range"
          name="${ifDefined(this.name || undefined)}"
          .value="${effectiveValue}"
          ?disabled="${this.disabled}"
          ?readonly="${this.readonly}"
          ?required="${this.required}"
          step="${this.getEffectiveStep()}"
          min="${this.getEffectiveMin()}"
          max="${this.getEffectiveMax()}"
          style="--range-progress: ${progress}%; --progress: ${progress}%"
          @input="${this.handleInput}"
          @change="${this.handleChange}"
          @focus="${this.handleFocus}"
          @blur="${this.handleBlur}"
          @click="${this.handleClick}"
        />
        ${this.renderTooltip(progress)}
        <div class="range-track-bg"></div>
        <div class="range-track-fill" style="width: ${progress}%"></div>
      </div>
      ${this.renderRangeValue()}
    `;
  }

  render() {
    return html`
      <div class="input-wrapper">
        ${this.renderLabel()}

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
    'unzer-range-input': UnzerRangeInput;
  }
}
