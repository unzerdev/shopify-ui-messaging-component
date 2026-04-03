import { html, CSSResultGroup, render as litRender, TemplateResult } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { UnzerElement } from '../../../base/unzer-element.js';
import { cssText } from '../../../utils/css-utils.js';
import '../input/text/unzer-text-input.js';
import selectStylesContent from './unzer-select.css?inline';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

/**
 * @summary Reusable select dropdown component with consistent styling
 * @description
 * A customizable dropdown select component that supports options, groups,
 * search/filter functionality, and consistent styling with the design system.
 *
 * @example
 * ```html
 * <unzer-select
 *   value="option1"
 *   placeholder="Select an option..."
 *   .options="${[
 *     { value: 'option1', label: 'Option 1' },
 *     { value: 'option2', label: 'Option 2' }
 *   ]}"
 *   @select-change="${this.handleChange}">
 * </unzer-select>
 * ```
 *
 * @fires select-change - Emitted when selection changes
 */
@customElement('unzer-select')
export class UnzerSelect extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cssText(selectStylesContent)
    ];
  }

  /**
   * Selected value
   */
  @property({ type: String })
  value = '';

  /**
   * Placeholder text when no value selected
   */
  @property({ type: String })
  placeholder = '';

  /**
   * Array of options to display
   */
  @property({ type: Array })
  options: SelectOption[] = [];

  /**
   * Form name attribute
   */
  @property({ type: String })
  name = '';

  /**
   * Whether select is disabled
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Whether select is required
   */
  @property({ type: Boolean })
  required = false;

  /**
   * Whether select has error state
   */
  @property({ type: Boolean, reflect: true })
  error = false;

  /**
   * Size variant
   */
  @property({ type: String, reflect: true })
  size: 'small' | 'medium' | 'large' | 'compact' = 'medium';

  /**
   * Whether to show search input
   */
  @property({ type: Boolean, attribute: 'searchable' })
  searchable = false;

  /**
   * Whether to close dropdown after selection
   */
  @property({ type: Boolean, attribute: 'close-on-select' })
  closeOnSelect = true;

  @state()
  private isOpen = false;

  @state()
  private searchTerm = '';

  @state()
  private focusedIndex = -1;

  @query('.select-trigger')
  private triggerElement!: HTMLElement;

  @query('.search-input')
  private searchInput!: HTMLInputElement;

  private portalDropdown: HTMLElement | null = null;

  private handleTriggerClick = (event: Event) => {
    event.stopPropagation();
    if (this.disabled) return;

    // Close any other open selects before opening this one
    if (!this.isOpen) {
      this.closeOtherSelects();
    }

    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      // Create portal dropdown
      this.createPortalDropdown();

      if (this.searchable) {
        // Focus search input if searchable
        setTimeout(() => {
          this.searchInput?.focus();
        }, 0);
      }
    } else {
      // Clean up portal
      this.cleanupPortal();
    }
  };

  private closeOtherSelects() {
    // Dispatch a custom event to close other selects
    document.dispatchEvent(
      new CustomEvent('unzer-select-open', {
        detail: { selectInstance: this },
      })
    );
  }

  private handleOptionClick = (option: SelectOption) => {
    if (option.disabled) return;

    this.value = option.value;
    this.focusedIndex = -1;

    if (this.closeOnSelect) {
      this.isOpen = false;
    }

    // Dispatch change events
    this.emit('unzer-change', {
      value: option.value,
      option: option,
      name: this.name,
    });

    this.dispatchEvent(
      new CustomEvent('select-change', {
        detail: {
          value: option.value,
          option: option,
          name: this.name,
        },
        bubbles: true,
      })
    );
  };

  private handleSearchInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase();
    this.focusedIndex = -1;
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (this.disabled) return;

    const filteredOptions = this.getFilteredOptions();

    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        if (!this.isOpen) {
          this.isOpen = true;
        } else if (this.focusedIndex >= 0 && filteredOptions[this.focusedIndex]) {
          this.handleOptionClick(filteredOptions[this.focusedIndex]);
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen) {
          this.isOpen = true;
        } else {
          this.focusedIndex = Math.min(this.focusedIndex + 1, filteredOptions.length - 1);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen) {
          this.focusedIndex = Math.max(this.focusedIndex - 1, 0);
        }
        break;

      case 'Escape':
        this.isOpen = false;
        this.focusedIndex = -1;
        this.triggerElement?.focus();
        break;

      case ' ':
        if (!this.isOpen) {
          event.preventDefault();
          this.isOpen = true;
        }
        break;
    }
  };

  private handleOutsideClick = (event: Event) => {
    if (
      !this.contains(event.target as Node) &&
      !this.portalDropdown?.contains(event.target as Node)
    ) {
      this.isOpen = false;
      this.focusedIndex = -1;
      this.cleanupPortal();
    }
  };

  private getFilteredOptions(): SelectOption[] {
    if (!this.searchTerm) return this.options;

    return this.options.filter(
      option =>
        option.label.toLowerCase().includes(this.searchTerm) ||
        option.value.toLowerCase().includes(this.searchTerm)
    );
  }

  private getSelectedOption(): SelectOption | null {
    return this.options.find(option => option.value === this.value) || null;
  }

  private getOptionGroups(): { [group: string]: SelectOption[] } {
    const filteredOptions = this.getFilteredOptions();
    const groups: { [group: string]: SelectOption[] } = {};

    filteredOptions.forEach(option => {
      const groupName = option.group || '';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(option);
    });

    return groups;
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this.handleOutsideClick);
    document.addEventListener('unzer-select-open', this.handleOtherSelectOpen as EventListener);
  }

  private handleOtherSelectOpen = (event: CustomEvent) => {
    // Close this select if another select is opening
    if (event.detail.selectInstance !== this && this.isOpen) {
      this.isOpen = false;
      this.focusedIndex = -1;
    }
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this.handleOutsideClick);
    document.removeEventListener('unzer-select-open', this.handleOtherSelectOpen as EventListener);
    this.cleanupPortal();
  }

  private createPortalDropdown() {
    UnzerSelect.cleanupAllPortals(); // Clean up all existing portals first
    this.cleanupPortal(); // Clean up any existing portal

    // Create portal element with all necessary styles
    this.portalDropdown = document.createElement('div');
    this.portalDropdown.className = 'unzer-select-portal';

    // Apply comprehensive styles
    this.portalDropdown.style.cssText = `
      position: fixed !important;
      z-index: 2147483647 !important;
      background: #ffffff !important;
      border: 1px solid #d1d5db !important;
      border-radius: 6px !important;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
      max-height: 240px !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      visibility: visible !important;
      min-width: 200px !important;
      max-width: 300px !important;
      box-sizing: border-box !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
      margin: 0 !important;
      padding: 0 !important;
    `;

    // Position relative to trigger
    const rect = this.getBoundingClientRect();
    this.portalDropdown.style.top = rect.bottom + 4 + 'px';
    this.portalDropdown.style.left = rect.left + 'px';
    this.portalDropdown.style.width = Math.max(rect.width, 200) + 'px';

    // Create dropdown content with proper styles
    this.renderPortalContent();

    // Append to body
    document.body.appendChild(this.portalDropdown);
  }

  private renderPortalContent() {
    if (!this.portalDropdown) return;
    litRender(this.renderPortalTemplate(), this.portalDropdown);
  }

  private renderPortalTemplate(): TemplateResult {
    const filteredOptions = this.getFilteredOptions();

    return html`
      ${this.searchable ? html`
        <div style="position: sticky; top: 0; padding: 8px; border-bottom: 1px solid #e5e7eb; background: #ffffff; z-index: 1;">
          <input
            type="text"
            placeholder="Search options..."
            style="width: 100%; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px; outline: none; box-sizing: border-box;"
            @input=${(e: Event) => {
              this.searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
              this.focusedIndex = -1;
              this.renderPortalContent();
            }}
          />
        </div>
      ` : ''}
      <div style="max-height: 200px; overflow-y: auto;">
        ${filteredOptions.length === 0
          ? html`<div style="padding: 16px 12px; text-align: center; color: #6b7280; font-style: italic; font-size: 13px;">
              No options found
            </div>`
          : filteredOptions.map((option, index) => this.renderPortalOption(option, index))}
      </div>
    `;
  }

  private renderPortalOption(option: SelectOption, index: number): TemplateResult {
    const isSelected = option.value === this.value;
    const isFocused = index === this.focusedIndex;

    return html`
      <div
        style="
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 8px 12px !important;
          font-size: 14px !important;
          color: ${isSelected ? '#635bff' : '#374151'} !important;
          cursor: ${option.disabled ? 'not-allowed' : 'pointer'} !important;
          transition: background-color 0.1s ease !important;
          border: none !important;
          background: ${isFocused ? '#f3f4f6' : isSelected ? '#f0f4f8' : '#ffffff'} !important;
          width: 100% !important;
          text-align: left !important;
          font-family: inherit !important;
          font-weight: ${isSelected ? '500' : '400'} !important;
          box-sizing: border-box !important;
          margin: 0 !important;
          user-select: none !important;
          ${option.disabled ? 'opacity: 0.5; pointer-events: none;' : ''}
        "
        @click=${() => {
          if (!option.disabled) {
            this.handleOptionClick(option);
            this.cleanupPortal();
          }
        }}
        @mouseover=${(e: Event) => {
          if (!option.disabled) {
            (e.currentTarget as HTMLElement).style.background = '#f3f4f6';
          }
        }}
        @mouseout=${(e: Event) => {
          (e.currentTarget as HTMLElement).style.background =
            isFocused ? '#f3f4f6' : isSelected ? '#f0f4f8' : '#ffffff';
        }}
      >
        ${option.label}
        ${isSelected ? html`<span style="font-weight: 600; color: #635bff; margin-left: auto;">&#10003;</span>` : ''}
      </div>
    `;
  }

  private cleanupPortal() {
    if (this.portalDropdown && this.portalDropdown.parentNode) {
      this.portalDropdown.parentNode.removeChild(this.portalDropdown);
    }
    this.portalDropdown = null;
  }

  private static cleanupAllPortals() {
    // Clean up any existing portal dropdowns from other instances
    const existingPortals = document.querySelectorAll('.unzer-select-portal');
    existingPortals.forEach(portal => {
      if (portal.parentNode) {
        portal.parentNode.removeChild(portal);
      }
    });
  }

  /**
   * Focus the select trigger
   */
  focus() {
    this.triggerElement?.focus();
  }

  /**
   * Blur the select trigger
   */
  blur() {
    this.triggerElement?.blur();
  }

  private renderSelectOptions() {
    const groups = this.getOptionGroups();
    const groupNames = Object.keys(groups);

    if (groupNames.length === 0) {
      return html`<div class="no-results">No options found</div>`;
    }

    return groupNames.map(groupName => {
      const options = groups[groupName];

      return html`
        ${groupName
          ? html`
              <div class="option-group">
                <div class="group-label">${groupName}</div>
                ${options.map((option, index) => this.renderOption(option, index))}
              </div>
            `
          : options.map((option, index) => this.renderOption(option, index))}
      `;
    });
  }

  private renderOption(option: SelectOption, index: number) {
    const isSelected = option.value === this.value;
    const isFocused = index === this.focusedIndex;
    const classes = `select-option ${isSelected ? 'selected' : ''} ${option.disabled ? 'disabled' : ''} ${isFocused ? 'focused' : ''}`;

    return html`
      <div
        class="${classes}"
        @click="${() => this.handleOptionClick(option)}"
        @mouseenter="${() => {
          this.focusedIndex = index;
        }}"
        role="option"
        aria-selected="${isSelected}"
        ?data-disabled="${option.disabled}"
      >
        ${option.label} ${isSelected ? html`<span class="checkmark">✓</span>` : ''}
      </div>
    `;
  }

  render() {
    const selectedOption = this.getSelectedOption();
    const triggerClasses = `select-trigger ${this.isOpen ? 'open' : ''} ${this.error ? 'error' : ''}`;
    const dropdownClasses = `select-dropdown`; // Never show original dropdown, portal handles visibility

    return html`
      <div class="select-container">
        <div
          class="${triggerClasses}"
          @click="${this.handleTriggerClick}"
          @keydown="${this.handleKeyDown}"
          tabindex="${this.disabled ? '-1' : '0'}"
          role="combobox"
          aria-expanded="${this.isOpen}"
          aria-haspopup="listbox"
        >
          <span class="select-value ${selectedOption ? '' : 'placeholder'}">
            ${selectedOption ? selectedOption.label : (this.placeholder || this.t('shared.select.placeholder'))}
          </span>

          <div class="select-icon ${this.isOpen ? 'open' : ''}">
            <svg viewBox="0 0 20 20">
              <path
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              />
            </svg>
          </div>
        </div>

        <div class="${dropdownClasses}" role="listbox">
          ${this.searchable
            ? html`
                <div class="select-search">
                  <unzer-text-input
                    type="text"
                    placeholder="Search options..."
                    @unzer-input="${this.handleSearchInput}"
                    @keydown="${this.handleKeyDown}"
                  >
                  </unzer-text-input>
                </div>
              `
            : ''}

          <div class="select-options">${this.renderSelectOptions()}</div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-select': UnzerSelect;
  }
}
