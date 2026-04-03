import { html, CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { UnzerBaseInput } from '../base/unzer-base-input.js';
import { cssText } from '../../../../utils/css-utils.js';
import fileInputStylesContent from '../styles/file-input.css?inline';

/**
 * @summary File input component with custom styling and button mode
 * @description
 * Specialized file input that can be displayed as a custom button
 * or traditional file input. Supports multiple files and custom accept types.
 *
 * @example
 * ```html
 * <!-- Traditional file input -->
 * <unzer-file-input accept=".json" @unzer-change="${this.handleFileChange}">
 * </unzer-file-input>
 *
 * <!-- Button-style file input -->
 * <unzer-file-input
 *   accept=".json"
 *   as-button
 *   display-content="📥 Import"
 *   class="action-btn">
 * </unzer-file-input>
 * ```
 *
 * @fires unzer-change - Emitted when files are selected, includes files property
 * @fires unzer-input - Emitted during file selection
 */
@customElement('unzer-file-input')
export class UnzerFileInput extends UnzerBaseInput {
  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cssText(fileInputStylesContent)
    ];
  }
  /** File accept attribute */
  @property({ type: String })
  accept = '';

  /** Multiple files selection */
  @property({ type: Boolean })
  multiple = false;

  /** Show as custom button instead of input field */
  @property({ type: Boolean, reflect: true, attribute: 'as-button' })
  asButton = false;

  /** Custom content to display when shown as button */
  @property({ type: String, attribute: 'display-content' })
  displayContent = '';

  /**
   * Get selected files
   */
  get files(): FileList | null {
    return this.inputElement?.files ?? null;
  }

  protected getInputType(): string {
    return 'file';
  }

  protected handleInput = (event: Event) => {
    const input = event.target as HTMLInputElement;

    // For file inputs, don't update this.value but pass the files
    this.error = false;

    // Emit events with file data
    this.emit('unzer-input', {
      value: input.value,
      files: input.files,
      name: this.name,
      type: this.getInputType(),
      originalEvent: event, // Pass original event for file handling
    });
    this.emit('input-change', {
      value: input.value,
      files: input.files,
      name: this.name,
      type: this.getInputType(),
      originalEvent: event,
    });
  };

  protected handleChange = (event: Event) => {
    const input = event.target as HTMLInputElement;

    // For file inputs, emit change event with files
    this.emit('unzer-change', {
      value: input.value,
      files: input.files,
      name: this.name,
      originalEvent: event,
    });
    this.emit('input-change', {
      value: input.value,
      files: input.files,
      name: this.name,
      originalEvent: event,
    });
  };

  protected getInputClasses() {
    return {
      ...super.getInputClasses(),
      'input--file': true,
    };
  }

  protected getContainerClasses() {
    return {
      ...super.getContainerClasses(),
      'input-container--file': true,
    };
  }

  protected renderInput() {
    return html`
      <input
        id="input"
        class="${this.getInputClasses()}"
        type="file"
        name="${ifDefined(this.name || undefined)}"
        placeholder="${ifDefined(this.placeholder || undefined)}"
        ?disabled="${this.disabled}"
        ?readonly="${this.readonly}"
        ?required="${this.required}"
        ?multiple="${this.multiple}"
        accept="${this.accept}"
        maxlength="${this.maxLength || ''}"
        minlength="${this.minLength || ''}"
        pattern="${this.pattern}"
        autocomplete="${this.autocomplete}"
        @input="${this.handleInput}"
        @change="${this.handleChange}"
        @focus="${this.handleFocus}"
        @blur="${this.handleBlur}"
      />
    `;
  }

  render() {
    // Special rendering for button-style file inputs
    if (this.asButton) {
      return html`
        <label class="hidden-file-input">
          ${this.displayContent || 'Choose File'}
          <input
            id="input"
            class="input-field"
            type="file"
            name="${ifDefined(this.name || undefined)}"
            ?disabled="${this.disabled}"
            ?required="${this.required}"
            ?multiple="${this.multiple}"
            accept="${this.accept}"
            @input="${this.handleInput}"
            @change="${this.handleChange}"
            @focus="${this.handleFocus}"
            @blur="${this.handleBlur}"
            style="position: absolute; width: 1px; height: 1px; opacity: 0; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;"
          />
        </label>
      `;
    }

    // Default rendering using base class
    return super.render();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-file-input': UnzerFileInput;
  }
}
