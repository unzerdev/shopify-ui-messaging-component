import { html, CSSResultGroup } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { UnzerElement } from '../../../base/unzer-element.js';
import { cssText } from '../../../utils/css-utils.js';
import textareaStylesContent from './styles/textarea.css?inline';
import '../button/unzer-button.js';

@customElement('unzer-textarea')
export class UnzerTextarea extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cssText(textareaStylesContent)
    ];
  }

  /** Label text */
  @property({ type: String })
  label = '';

  /** Form name attribute */
  @property({ type: String })
  name = '';

  /** Textarea value */
  @property({ type: String })
  value = '';

  /** Placeholder text */
  @property({ type: String })
  placeholder = '';

  /** Whether textarea is required */
  @property({ type: Boolean })
  required = false;

  /** Whether textarea is readonly */
  @property({ type: Boolean, reflect: true })
  readonly = false;

  /** Help text to display below textarea */
  @property({ type: String, attribute: 'help-text' })
  helpText = '';

  /** Error message to display (overrides help text when shown) */
  @property({ type: String, attribute: 'error-message' })
  errorMessage = '';

  /** Whether textarea has error state */
  @property({ type: Boolean, reflect: true })
  error = false;

  /** Whether textarea has success state */
  @property({ type: Boolean, reflect: true })
  success = false;

  /** Whether textarea has warning state */
  @property({ type: Boolean, reflect: true })
  warning = false;

  /** Whether textarea is in loading state */
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

  /** Number of rows */
  @property({ type: Number })
  rows = 3;

  /** Number of columns */
  @property({ type: Number })
  cols = 0;

  /** Resize behavior */
  @property({ type: String })
  resize: 'none' | 'both' | 'horizontal' | 'vertical' | 'auto' = 'vertical';

  /** Autocomplete attribute */
  @property({ type: String })
  autocomplete = '';

  /** Whether to show character count */
  @property({ type: Boolean, attribute: 'show-count', reflect: true })
  showCount = false;

  /** Whether to show clear button when textarea has value */
  @property({ type: Boolean, reflect: true })
  clearable = false;

  /** Whether to auto-resize based on content */
  @property({ type: Boolean, attribute: 'auto-resize', reflect: true })
  autoResize = false;

  @state()
  private hasFocus = false;

  @query('textarea')
  private textareaElement!: HTMLTextAreaElement;

  connectedCallback() {
    super.connectedCallback();
    if (this.autoResize) {
      this.requestUpdate();
    }
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (
      this.autoResize &&
      (changedProperties.has('value') || changedProperties.has('autoResize'))
    ) {
      this.adjustHeight();
    }
  }

  private adjustHeight() {
    if (!this.textareaElement || !this.autoResize) return;

    // Reset height to auto to get the correct scrollHeight
    this.textareaElement.style.height = 'auto';
    this.textareaElement.style.height = `${this.textareaElement.scrollHeight}px`;
  }

  private handleInput = (event: Event) => {
    const textarea = event.target as HTMLTextAreaElement;
    this.value = textarea.value;
    this.error = false; // Clear error on input

    if (this.autoResize) {
      this.adjustHeight();
    }

    // Emit both event styles for compatibility
    this.emit('unzer-input', { value: this.value, name: this.name });
    this.emit('textarea-change', { value: this.value, name: this.name });
  };

  private handleChange = (event: Event) => {
    const textarea = event.target as HTMLTextAreaElement;
    this.value = textarea.value;

    // Emit both event styles for compatibility
    this.emit('unzer-change', { value: this.value, name: this.name });
    this.emit('textarea-change', { value: this.value, name: this.name });
  };

  private handleFocus = () => {
    this.hasFocus = true;

    // Emit both event styles for compatibility
    this.emit('unzer-focus', { name: this.name });
    this.emit('textarea-focus', { name: this.name });
  };

  private handleBlur = () => {
    this.hasFocus = false;

    // Emit both event styles for compatibility
    this.emit('unzer-blur', { name: this.name });
    this.emit('textarea-blur', { name: this.name });
  };

  private handleClear = () => {
    this.value = '';
    this.textareaElement.focus();

    if (this.autoResize) {
      this.adjustHeight();
    }

    this.emit('unzer-input', { value: this.value, name: this.name });
    this.emit('textarea-change', { value: this.value, name: this.name });
  };

  /**
   * Focus the textarea
   */
  focus() {
    this.textareaElement?.focus();
  }

  /**
   * Blur the textarea
   */
  blur() {
    this.textareaElement?.blur();
  }

  /**
   * Select all text in the textarea
   */
  select() {
    this.textareaElement?.select();
  }

  /**
   * Clear the textarea value
   */
  clear() {
    this.handleClear();
  }

  /**
   * Check validity of the textarea
   */
  checkValidity(): boolean {
    return this.textareaElement?.checkValidity() ?? false;
  }

  /**
   * Report validity of the textarea
   */
  reportValidity(): boolean {
    return this.textareaElement?.reportValidity() ?? false;
  }

  private renderLabel() {
    if (!this.label) return '';

    return html`
      <label class="label ${classMap({ 'label--required': this.required })}" for="textarea">
        ${this.label}
      </label>
    `;
  }

  private renderHelpText() {
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

  private renderCharacterCount() {
    const count = this.value.length;
    const isOverLimit = this.maxLength > 0 && count > this.maxLength;

    return html`
      <span class="character-count ${classMap({ 'over-limit': isOverLimit })}">
        ${count}${this.maxLength > 0 ? `/${this.maxLength}` : ''}
      </span>
    `;
  }

  private renderClearButton() {
    if (!this.clearable || !this.value || this.disabled || this.readonly) {
      return '';
    }

    return html`
      <unzer-button
        type="button"
        variant="ghost"
        size="small"
        icon-only
        @button-click="${this.handleClear}"
        title="Clear textarea"
      >
        <svg slot="default" viewBox="0 0 24 24">
          <path
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
          />
        </svg>
      </unzer-button>
    `;
  }

  render() {
    const textareaClasses = {
      'textarea-field': true,
      'textarea--error': this.error,
      'textarea--success': this.success,
      'textarea--warning': this.warning,
      'textarea--loading': this.loading,
      'textarea--focused': this.hasFocus,
      'textarea--auto-resize': this.autoResize,
    };

    const containerClasses = {
      'textarea-container': true,
      'textarea-container--error': this.error,
      'textarea-container--success': this.success,
      'textarea-container--warning': this.warning,
      'textarea-container--loading': this.loading,
      'textarea-container--disabled': this.disabled,
      'textarea-container--readonly': this.readonly,
      'textarea-container--focused': this.hasFocus,
    };

    const resizeStyle = this.resize !== 'auto' ? `resize: ${this.resize}` : '';

    return html`
      <div class="textarea-wrapper">
        ${this.renderLabel()}

        <div class="${classMap(containerClasses)}">
          <div class="textarea-field-wrapper">
            <textarea
              id="textarea"
              class="${classMap(textareaClasses)}"
              name="${ifDefined(this.name || undefined)}"
              placeholder="${ifDefined(this.placeholder || undefined)}"
              .value="${this.value}"
              ?disabled="${this.disabled}"
              ?readonly="${this.readonly}"
              ?required="${this.required}"
              rows="${this.rows}"
              cols="${this.cols || ''}"
              maxlength="${this.maxLength || ''}"
              minlength="${this.minLength || ''}"
              autocomplete="${this.autocomplete}"
              style="${resizeStyle}"
              @input="${this.handleInput}"
              @change="${this.handleChange}"
              @focus="${this.handleFocus}"
              @blur="${this.handleBlur}"
            >
            </textarea>

            ${this.renderClearButton()}
          </div>
        </div>

        ${this.renderHelpText()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-textarea': UnzerTextarea;
  }
}
