import { html, CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UnzerElement } from '../../../base/unzer-element.js';
import { cssText } from '../../../utils/css-utils.js';

const optionStyles = `
:host {
  display: block;
}

.option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 44px;
}

.option:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #1e40af;
  transform: translateX(4px);
}

.option.selected {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #1e40af;
  font-weight: 600;
  transform: translateX(4px);
  box-shadow: -3px 0 0 #3b82f6;
}

.option:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.option:disabled:hover {
  background: transparent;
  color: #374151;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
}

.option-description {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 2px;
}
`;

/**
 * @summary Option component for select dropdowns
 * @description
 * An option element that can be used within select components.
 */
@customElement('unzer-option')
export class UnzerOption extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cssText(optionStyles)
    ];
  }

  /**
   * The value of the option
   */
  @property({ type: String })
  value = '';

  /**
   * The display label for the option
   */
  @property({ type: String })
  label = '';

  /**
   * Whether the option is disabled
   */
  @property({ type: Boolean })
  disabled = false;

  /**
   * Whether the option is selected
   */
  @property({ type: Boolean })
  selected = false;

  /**
   * Optional icon to display
   */
  @property({ type: String })
  icon = '';

  /**
   * Optional description text
   */
  @property({ type: String })
  description = '';

  private handleClick = (event: Event) => {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.emit('option-select', {
      value: this.value,
      label: this.label || this.textContent?.trim() || this.value,
      option: this,
    });
  };

  render() {
    return html`
      <div
        class="option ${this.selected ? 'selected' : ''}"
        @click="${this.handleClick}"
        role="option"
        aria-selected="${this.selected}"
        aria-disabled="${this.disabled}"
      >
        <div class="option-content">
          ${this.icon ? html`<span class="option-icon">${this.icon}</span>` : ''}
          <div class="option-text">
            <div>${this.label || html`<slot></slot>`}</div>
            ${this.description ? html`<div class="option-description">${this.description}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-option': UnzerOption;
  }
}