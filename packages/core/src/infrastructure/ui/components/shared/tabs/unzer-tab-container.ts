import { html, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { UnzerElement } from '../../../base/unzer-element.js';
import { cssText } from '../../../utils/css-utils.js';
import tabContainerStylesContent from './styles/unzer-tab-container.css?inline';

export interface TabItem {
  id: string;
  label: string;
  icon?: string; // SVG string or icon name
  disabled?: boolean;
}

export interface TabChangeEvent {
  activeTab: string;
  previousTab: string | null;
}

/**
 * @summary Reusable tab container with Unzer-style design
 * @description
 * A flexible tab navigation component that supports icons, disabled states,
 * and consistent Unzer-style styling. Manages active tab state internally.
 *
 * @example
 * ```html
 * <unzer-tab-container
 *   active-tab="general"
 *   .tabs="${[
 *     { id: 'general', label: 'General', icon: '...' },
 *     { id: 'styling', label: 'Style', icon: '...' }
 *   ]}"
 *   @tab-change="${this.handleTabChange}">
 *   <div slot="general">General content</div>
 *   <div slot="styling">Style content</div>
 * </unzer-tab-container>
 * ```
 *
 * @fires tab-change - Emitted when active tab changes
 * @slot {tab-id} - Content for each tab (slot name matches tab id)
 */
@customElement('unzer-tab-container')
export class UnzerTabContainer extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cssText(tabContainerStylesContent)
    ];
  }

  /**
   * Array of tab items to display
   */
  @property({ type: Array })
  tabs: TabItem[] = [];

  /**
   * Currently active tab ID
   */
  @property({ type: String, attribute: 'active-tab' })
  activeTab = '';

  /**
   * Whether to show tab icons
   */
  @property({ type: Boolean, attribute: 'show-icons' })
  showIcons = true;

  @state()
  private previousTab: string | null = null;

  connectedCallback() {
    super.connectedCallback();

    // Set first tab as active if none specified
    if (!this.activeTab && this.tabs.length > 0) {
      this.activeTab = this.tabs[0].id;
    }
  }

  willUpdate(changedProperties: Map<string, unknown>) {
    super.willUpdate(changedProperties);

    // Ensure we have an active tab when tabs are set
    if (changedProperties.has('tabs') && this.tabs.length > 0) {
      if (!this.activeTab || !this.tabs.find(tab => tab.id === this.activeTab)) {
        this.activeTab = this.tabs[0].id;
      }
    }
  }

  private handleTabClick = (tabId: string) => {
    if (this.activeTab === tabId) return;

    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab || tab.disabled) return;

    this.previousTab = this.activeTab;
    this.activeTab = tabId;

    // Dispatch change event
    this.dispatchEvent(
      new CustomEvent('tab-change', {
        detail: {
          activeTab: tabId,
          previousTab: this.previousTab,
        } as TabChangeEvent,
        bubbles: true,
      })
    );

    // Trigger re-render
    this.requestUpdate();
  };

  private handleKeyDown = (event: KeyboardEvent, tabId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleTabClick(tabId);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      this.handleArrowNavigation(event.key === 'ArrowRight');
    }
  };

  private handleArrowNavigation = (forward: boolean) => {
    const enabledTabs = this.tabs.filter(tab => !tab.disabled);
    const currentIndex = enabledTabs.findIndex(tab => tab.id === this.activeTab);

    let nextIndex;
    if (forward) {
      nextIndex = (currentIndex + 1) % enabledTabs.length;
    } else {
      nextIndex = currentIndex === 0 ? enabledTabs.length - 1 : currentIndex - 1;
    }

    this.handleTabClick(enabledTabs[nextIndex].id);

    // Focus the new tab button
    const newButton = this.shadowRoot?.querySelector(
      `.tab-button[data-tab="${enabledTabs[nextIndex].id}"]`
    ) as HTMLButtonElement;
    newButton?.focus();
  };

  private renderTabIcon(tab: TabItem) {
    if (!this.showIcons || !tab.icon) return '';

    // If icon is SVG string, render directly
    if (tab.icon.includes('<svg')) {
      return html`<div class="tab-icon" .innerHTML="${tab.icon}"></div>`;
    }

    // Otherwise treat as icon name/class
    return html`<div class="tab-icon"><i class="${tab.icon}"></i></div>`;
  }

  render() {
    return html`
      <div class="tab-navigation" role="tablist">
        ${this.tabs.map(
          tab => html`
            <div
              class="tab-button ${this.activeTab === tab.id ? 'active' : ''} ${tab.disabled
                ? 'disabled'
                : ''}"
              data-tab="${tab.id}"
              role="tab"
              aria-selected="${this.activeTab === tab.id}"
              aria-controls="tab-panel-${tab.id}"
              tabindex="${this.activeTab === tab.id ? '0' : '-1'}"
              @click="${() => this.handleTabClick(tab.id)}"
              @keydown="${(e: KeyboardEvent) => this.handleKeyDown(e, tab.id)}"
            >
              ${this.renderTabIcon(tab)}
              <span>${tab.label}</span>
            </div>
          `
        )}
      </div>

      <div class="tab-content" role="tabpanel" aria-labelledby="tab-${this.activeTab}">
        <div class="tab-content-inner">
          ${this.tabs.map(
            tab => html`
              <div
                class="tab-panel ${this.activeTab === tab.id ? 'active' : 'inactive'}"
                id="tab-panel-${tab.id}"
              >
                <slot name="${tab.id}"></slot>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-tab-container': UnzerTabContainer;
  }
}
