import { html, CSSResultGroup } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { UnzerElement } from '../../../../base/unzer-element.js';
import { cssText } from '../../../../utils/css-utils.js';
import baseInputStylesContent from '../styles/base.css?inline';
import '../../button/unzer-button.js';

/**
 * Abstract base class for all input components
 * Provides common functionality like validation, styling, events
 */
export abstract class UnzerBaseInput extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cssText(baseInputStylesContent)
    ];
  }
  /** Label text */
  @property({ type: String })
  label = '';

  /** Form name attribute */
  @property({ type: String })
  name = '';

  /** Input value */
  @property({ type: String })
  value = '';

  /** Placeholder text */
  @property({ type: String })
  placeholder = '';

  /** Whether input is required */
  @property({ type: Boolean })
  required = false;

  /** Whether input is readonly */
  @property({ type: Boolean, reflect: true })
  readonly = false;

  /** Help text to display below input */
  @property({ type: String, attribute: 'help-text' })
  helpText = '';

  /** Error message to display (overrides help text when shown) */
  @property({ type: String, attribute: 'error-message' })
  errorMessage = '';

  /** Whether input has error state */
  @property({ type: Boolean, reflect: true })
  error = false;

  /** Whether input has success state */
  @property({ type: Boolean, reflect: true })
  success = false;

  /** Whether input has warning state */
  @property({ type: Boolean, reflect: true })
  warning = false;

  /** Whether input is in loading state */
  @property({ type: Boolean, reflect: true })
  loading = false;

  /** Size variant */
  @property({ type: String, reflect: true })
  size: 'small' | 'medium' | 'large' = 'medium';

  /** Maximum length */
  @property({ type: Number, attribute: 'max-length' })
  maxLength = 0;

  /** Minimum length */
  @property({ type: Number, attribute: 'min-length' })
  minLength = 0;

  /** Pattern for validation */
  @property({ type: String })
  pattern = '';

  /** Autocomplete attribute */
  @property({ type: String })
  autocomplete = '';

  /** Left/start icon (SVG string or slot) */
  @property({ type: String, attribute: 'start-icon' })
  startIcon = '';

  /** Right/end icon (SVG string or slot) */
  @property({ type: String, attribute: 'end-icon' })
  endIcon = '';

  /** Whether to show clear button when input has value */
  @property({ type: Boolean, reflect: true })
  clearable = false;

  /** Whether to show character count */
  @property({ type: Boolean, attribute: 'show-count', reflect: true })
  showCount = false;

  @state()
  protected hasFocus = false;

  @query('input')
  protected inputElement!: HTMLInputElement;

  protected get hasStartIcon() {
    return !!this.startIcon || !!this.querySelector('[slot="start-icon"]');
  }

  protected get hasEndIcon() {
    return !!this.endIcon || !!this.querySelector('[slot="end-icon"]');
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('has-start-icon', this.hasStartIcon.toString());
    this.setAttribute('has-end-icon', this.hasEndIcon.toString());
  }

  protected handleInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.error = false; // Clear error on input

    // Emit events
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
  };

  protected handleChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    this.value = input.value;

    // Emit events
    this.emit('unzer-change', { value: this.value, name: this.name });
    this.emit('input-change', { value: this.value, name: this.name });
  };

  protected handleFocus = () => {
    this.hasFocus = true;

    // Emit events
    this.emit('unzer-focus', { name: this.name });
    this.emit('input-focus', { name: this.name });
  };

  protected handleBlur = () => {
    this.hasFocus = false;

    // Emit events
    this.emit('unzer-blur', { name: this.name });
    this.emit('input-blur', { name: this.name });
  };

  protected handleClear = () => {
    this.value = '';
    this.inputElement.focus();
    this.emit('unzer-input', { value: this.value, name: this.name });
    this.emit('input-change', { value: this.value, name: this.name });
  };

  /**
   * Focus the input
   */
  focus() {
    this.inputElement?.focus();
  }

  /**
   * Blur the input
   */
  blur() {
    this.inputElement?.blur();
  }

  /**
   * Select all text in the input
   */
  select() {
    this.inputElement?.select();
  }

  /**
   * Clear the input value
   */
  clear() {
    this.handleClear();
  }

  /**
   * Check validity of the input
   */
  checkValidity(): boolean {
    return this.inputElement?.checkValidity() ?? false;
  }

  /**
   * Report validity of the input
   */
  reportValidity(): boolean {
    return this.inputElement?.reportValidity() ?? false;
  }

  /**
   * Get the input type - to be implemented by subclasses
   */
  protected abstract getInputType(): string;

  /**
   * Render the input element - to be implemented by subclasses
   */
  protected abstract renderInput(): unknown;

  /**
   * Get input classes - can be overridden by subclasses
   */
  protected getInputClasses() {
    return {
      'input-field': true,
      'input--error': this.error,
      'input--success': this.success,
      'input--warning': this.warning,
      'input--loading': this.loading,
      'input--has-start-icon': this.hasStartIcon,
      'input--has-end-icon': this.hasEndIcon || this.clearable,
      'input--focused': this.hasFocus,
    };
  }

  /**
   * Get container classes - can be overridden by subclasses
   */
  protected getContainerClasses() {
    return {
      'input-container': true,
      'input-container--error': this.error,
      'input-container--success': this.success,
      'input-container--warning': this.warning,
      'input-container--loading': this.loading,
      'input-container--disabled': this.disabled,
      'input-container--readonly': this.readonly,
      'input-container--focused': this.hasFocus,
    };
  }

  protected renderIcon(icon: string, position: 'start' | 'end') {
    if (!icon) return '';

    return html` <span class="input-icon input-icon--${position}"> ${icon} </span> `;
  }

  protected renderLabel() {
    if (!this.label) return '';

    return html`
      <label class="label ${classMap({ 'label--required': this.required })}" for="input">
        ${this.label}
      </label>
    `;
  }

  protected renderHelpText() {
    const text = this.error && this.errorMessage ? this.errorMessage : this.helpText;
    if (!text && !this.showCount) return '';

    return html`
      <div class="help-container">
        ${text
          ? html`
              <span
                class="help-text ${classMap({
                  'help-text--error': this.error && !!this.errorMessage,
                  'help-text--warning': this.warning,
                  'help-text--success': this.success,
                })}"
              >
                ${text}
              </span>
            `
          : ''}
        ${this.showCount ? this.renderCharacterCount() : ''}
      </div>
    `;
  }

  protected renderCharacterCount() {
    const count = this.value.length;
    const isOverLimit = this.maxLength > 0 && count > this.maxLength;

    return html`
      <span class="character-count ${classMap({ 'over-limit': isOverLimit })}">
        ${count}${this.maxLength > 0 ? `/${this.maxLength}` : ''}
      </span>
    `;
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
          title="Clear input"
        >
          <svg slot="default" viewBox="0 0 24 24">
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            />
          </svg>
        </unzer-button>
      `);
    }

    return actions.length > 0 ? html`<div class="input-actions">${actions}</div>` : '';
  }

  render() {
    return html`
      <div class="input-wrapper">
        ${this.renderLabel()}

        <div class="${classMap(this.getContainerClasses())}">
          <div class="input-field-wrapper">
            ${this.renderIcon(this.startIcon, 'start')}
            <slot name="start-icon"></slot>

            ${this.renderInput()} ${this.renderIcon(this.endIcon, 'end')}
            <slot name="end-icon"></slot>

            ${this.renderActions()}
          </div>
        </div>

        ${this.renderHelpText()}
      </div>
    `;
  }
}
