import { html, PropertyValues, CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UnzerElement } from '../../../base/unzer-element.js';
import { cssText } from '../../../utils/css-utils.js';

export interface DragOptionClickEvent {
  option: string | boolean;
  active: boolean;
}

/**
 * @summary Reusable draggable option component
 * @description
 * A standardized drag-and-drop option with icon, label, and interactive states.
 * Supports active, disabled, and hover states with consistent styling.
 *
 * @example
 * ```html
 * <unzer-drag-option
 *   option="buttons"
 *   label="Buttons"
 *   active
 *   @drag-option-click="${this.handleOptionClick}"
 *   @dragstart="${this.handleDragStart}">
 *   <svg slot="icon" width="18" height="18">...</svg>
 * </unzer-drag-option>
 * ```
 *
 * @fires drag-option-click - Emitted when option is clicked
 * @slot icon - SVG icon to display in the option
 */
@customElement('unzer-drag-option')
export class UnzerDragOption extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cssText(`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: all 0.15s ease;
      user-select: none;
    }

    /* Default variant - compact style */
    :host([variant="default"]) {
      padding: 12px 10px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      min-width: 64px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    :host([variant="default"]:hover) {
      border-color: #6366f1;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
      transform: translateY(-1px);
    }

    :host([variant="default"][active]) {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-color: #6366f1;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }


    :host([variant="card"]) {
      background: white;
      border: 1px solid #e3e8ee;
      border-radius: 8px;
      padding: 20px;
      min-height: 120px;
      min-width: 80px;
      max-width: 100%;
      justify-content: space-between;
      box-shadow: 0 1px 3px rgba(50, 50, 93, 0.15), 0 1px 0 rgba(0, 0, 0, 0.02);
      box-sizing: border-box;
    }

    :host([variant="card"]:hover) {
      border-color: #c7d2fe;
      box-shadow: 0 2px 6px rgba(50, 50, 93, 0.15), 0 1px 2px rgba(0, 0, 0, 0.08);
      transform: translateY(-1px);
    }

    :host([variant="card"][active]) {
      border-color: #635bff;
      box-shadow: 0 2px 8px rgba(99, 91, 255, 0.25);
      background: #fafaff;
    }

    :host([disabled]) {
      opacity: 0.5;
      cursor: not-allowed;
      background: #f8fafc;
      border-color: #e2e8f0;
      pointer-events: none;
    }

    :host([disabled]:hover) {
      transform: none;
      border-color: #e2e8f0;
      box-shadow: none;
    }

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      height: 40px;
    }

    :host([variant="default"]) .icon {
      margin-bottom: 2px;
      height: auto;
    }

    ::slotted(svg) {
      width: 18px;
      height: 18px;
      transition: all 0.15s ease;
    }

    :host([variant="default"][active]) ::slotted(svg) {
      filter: brightness(0) invert(1);
    }

    .label {
      font-size: 14px;
      font-weight: 500;
      color: #1a1f36;
      text-align: center;
      margin-bottom: 8px;
      line-height: 1.2;
    }

    :host([variant="default"]) .label {
      font-size: 10px;
      margin-top: 4px;
      margin-bottom: 0;
      letter-spacing: 0.025em;
    }

    :host([variant="default"][active]) .label {
      color: #ffffff;
    }

    .dots {
      text-align: center;
      color: #6b7c93;
      font-size: 16px;
      line-height: 1;
      font-weight: bold;
      letter-spacing: 2px;
    }

    :host([variant="default"]) .dots {
      display: none;
    }

    /* Drag state styling */
    :host(.dragging) {
      opacity: 0.5;
    }

    /* Click-only-when-active styling */
    :host([click-only-when-active]:not([active])) {
      cursor: grab;
    }

    :host([click-only-when-active]:not([active]):hover) {
      cursor: grab;
    }

    :host([click-only-when-active][active]) {
      cursor: pointer;
    }

    :host([click-only-when-active][active]:hover) {
      cursor: pointer;
    }
      `)
    ];
  }

  /**
   * Unique identifier for this option
   */
  @property()
  option: string | boolean = '';

  /**
   * Label text to display
   */
  @property({ type: String })
  label = '';

  /**
   * Whether this option is currently active
   */
  @property({ type: Boolean, reflect: true })
  active = false;

  /**
   * Whether this option is disabled
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Tooltip text for hover
   */
  @property({ type: String })
  tooltip = '';

  /**
   * Whether this option is draggable
   */
  @property({ type: Boolean })
  draggable = true;

  /**
   * Visual style variant
   */
  @property({ type: String })
  variant: 'default' | 'card' = 'default';

  /**
   * Only allow click action when component is active (for remove-only behavior)
   */
  @property({ type: Boolean, attribute: 'click-only-when-active' })
  clickOnlyWhenActive = false;

  connectedCallback() {
    super.connectedCallback();
    this.updateDragState();

    // Set up click handler (always available)
    this.addEventListener('click', this.handleClick);
  }

  private updateDragState() {
    // Set up drag and drop if enabled and not disabled
    if (this.draggable && !this.disabled) {
      this.setAttribute('draggable', 'true');
      this.addEventListener('dragstart', this.handleDragStart);
      this.addEventListener('dragend', this.handleDragEnd);
    } else {
      this.setAttribute('draggable', 'false');
      this.removeEventListener('dragstart', this.handleDragStart);
      this.removeEventListener('dragend', this.handleDragEnd);
    }

    // Set up tooltip
    if (this.tooltip) {
      this.setAttribute('title', this.tooltip);
    }
  }

  updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    // Update drag state when relevant properties change
    if (changedProperties.has('draggable') || changedProperties.has('disabled')) {
      this.updateDragState();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('dragstart', this.handleDragStart);
    this.removeEventListener('dragend', this.handleDragEnd);
    this.removeEventListener('click', this.handleClick);
  }

  private handleDragStart = (event: DragEvent) => {
    if (this.disabled) {
      event.preventDefault();
      return;
    }

    this.classList.add('dragging');

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(this.option));
    }

    // Store original opacity to restore later
    this.dataset.originalOpacity = this.style.opacity || '';
    
    // Add visual feedback
    this.style.opacity = '0.5';

    // Dispatch custom drag start event
    this.dispatchEvent(
      new CustomEvent('drag-option-start', {
        detail: { option: this.option, originalEvent: event },
        bubbles: true,
      })
    );
  };

  private handleDragEnd = () => {
    this.classList.remove('dragging');

    // Reset visual feedback to original value
    this.style.opacity = this.dataset.originalOpacity || '';
    delete this.dataset.originalOpacity;

    // Dispatch custom drag end event
    this.dispatchEvent(
      new CustomEvent('drag-option-end', {
        detail: { option: this.option },
        bubbles: true,
      })
    );
  };

  private handleClick = (event: Event) => {
    if (this.disabled) {
      event.preventDefault();
      return;
    }

    // If clickOnlyWhenActive is true, only allow click when active (for remove-only behavior)
    if (this.clickOnlyWhenActive && !this.active) {
      return;
    }

    // Dispatch custom click event
    this.dispatchEvent(
      new CustomEvent('drag-option-click', {
        detail: {
          option: this.option,
          active: this.active,
        } as DragOptionClickEvent,
        bubbles: true,
      })
    );
  };


  render() {
    return html`
      <div class="icon">
        <slot name="icon"></slot>
      </div>
      <div class="label">${this.label}</div>
      ${this.variant === 'card' ? html`<div class="dots">...</div>` : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-drag-option': UnzerDragOption;
  }
}
