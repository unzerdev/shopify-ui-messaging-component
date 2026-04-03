import { html, CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UnzerElement } from '../../../base/unzer-element.js';
import { cssText } from '../../../utils/css-utils.js';
import formSectionStylesContent from './styles/unzer-form-section.css?inline';
import '../button/unzer-button.js';

/**
 * @summary Reusable form section component for organized layouts
 * @description
 * A structured form section with title, description, and content area.
 * Provides consistent spacing, typography, and visual hierarchy.
 *
 * @example
 * ```html
 * <unzer-form-section
 *   title="General Settings"
 *   description="Configure basic parameters and options"
 *   collapsible>
 *   <unzer-form-group label="Name">
 *     <unzer-text-input type="text"></unzer-text-input>
 *   </unzer-form-group>
 * </unzer-form-section>
 * ```
 *
 * @slot default - Form content (form groups, controls)
 * @slot actions - Action buttons or controls for the section
 */
@customElement('unzer-form-section')
export class UnzerFormSection extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      ...(super.styles instanceof Array ? super.styles : [super.styles]),
      cssText(formSectionStylesContent)
    ];
  }

  /**
   * Section title
   */
  @property({ type: String })
  title = '';

  /**
   * Optional section description
   */
  @property({ type: String })
  description = '';

  /**
   * Icon to display next to title (SVG string)
   */
  @property({ type: String })
  icon = '';

  /**
   * Whether section can be collapsed
   */
  @property({ type: Boolean })
  collapsible = false;

  /**
   * Whether section is collapsed (only if collapsible)
   */
  @property({ type: Boolean, reflect: true })
  collapsed = false;

  /**
   * Whether section is required
   */
  @property({ type: Boolean })
  required = false;

  /**
   * Whether section is disabled
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Layout variant for form content
   */
  @property({ type: String, reflect: true })
  layout: 'default' | 'grid-2' | 'grid-3' | 'grid-4' = 'default';

  /**
   * Visual variant
   */
  @property({ type: String, reflect: true })
  variant: 'default' | 'compact' | 'spacious' = 'default';

  private toggleCollapsed = () => {
    if (!this.collapsible) return;

    this.collapsed = !this.collapsed;

    // Dispatch custom event
    this.dispatchEvent(
      new CustomEvent('section-toggle', {
        detail: { collapsed: this.collapsed, title: this.title },
        bubbles: true,
      })
    );
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleCollapsed();
    }
  };

  render() {
    const hasActions = this.querySelector('[slot="actions"]') !== null;

    return html`
      <div class="form-section">
        ${this.title || this.description || this.collapsible || hasActions
          ? html`
              <div class="section-header">
                <div class="header-content">
                  ${this.title
                    ? html`
                        <h3 class="section-title">
                          ${this.icon
                            ? html` <div class="section-icon" .innerHTML="${this.icon}"></div> `
                            : ''}
                          ${this.title}
                          ${this.required ? html` <span class="required-indicator">*</span> ` : ''}
                        </h3>
                      `
                    : ''}
                  ${this.description
                    ? html` <p class="section-description">${this.description}</p> `
                    : ''}
                </div>

                <div class="section-actions">
                  <slot name="actions"></slot>

                  ${this.collapsible
                    ? html`
                        <unzer-button
                          variant="ghost"
                          size="small"
                          icon-only
                          @button-click="${this.toggleCollapsed}"
                          @keydown="${this.handleKeyDown}"
                          aria-expanded="${!this.collapsed}"
                          aria-controls="section-content"
                          title="${this.collapsed ? this.t('shared.formSection.expand') : this.t('shared.formSection.collapse')}"
                        >
                          <svg slot="default" viewBox="0 0 24 24">
                            <path d="M7 10l5 5 5-5z" />
                          </svg>
                        </unzer-button>
                      `
                    : ''}
                </div>
              </div>
            `
          : ''}

        <div
          class="section-content ${this.collapsed ? 'collapsed' : ''}"
          id="section-content"
          aria-hidden="${this.collapsed}"
        >
          <slot></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-form-section': UnzerFormSection;
  }
}
