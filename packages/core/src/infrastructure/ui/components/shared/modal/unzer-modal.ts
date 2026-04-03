import { html, CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UnzerElement } from '../../../base/unzer-element.js';
import { cssText } from '../../../utils/css-utils.js';
import '../button/unzer-button.js';
import modalStylesContent from './styles/modal.css?inline';

/**
 * @summary Generic modal component
 * @description A reusable modal dialog component with overlay, close functionality, and customizable content
 *
 * @example
 * ```html
 * <unzer-modal
 *   .open="${true}"
 *   title="Modal Title"
 *   @modal-close="${handleClose}">
 *   <p>Modal content goes here</p>
 * </unzer-modal>
 * ```
 *
 * @fires modal-close - Fired when the modal is closed
 * @slot default - The modal content
 * @slot footer - Optional footer content (usually buttons)
 */
@customElement('unzer-modal')
export class UnzerModal extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cssText(modalStylesContent)
    ];
  }

  /** Whether the modal is open */
  @property({ type: Boolean, reflect: true })
  open = false;

  /** Modal title */
  @property({ type: String })
  title = '';

  /** Whether to show the close button */
  @property({ type: Boolean, attribute: 'show-close' })
  showClose = true;

  /** Whether clicking overlay closes the modal */
  @property({ type: Boolean, attribute: 'close-on-overlay' })
  closeOnOverlay = true;

  /** Whether pressing Escape closes the modal */
  @property({ type: Boolean, attribute: 'close-on-escape' })
  closeOnEscape = true;

  private handleOverlayClick(_e: Event) {
    if (!this.closeOnOverlay) return;
    this.closeModal();
  }

  private handleContentClick(e: Event) {
    // Prevent overlay click when clicking inside content
    e.stopPropagation();
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (!this.closeOnEscape) return;
    if (e.key === 'Escape') {
      this.closeModal();
    }
  };

  private closeModal() {
    this.open = false;
    this.emit('modal-close');
  }

  updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has('open')) {
      if (this.open) {
        // Modal opened
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', this.handleKeyDown);

        // Focus the modal after it opens
        this.updateComplete.then(() => {
          const modalContent = this.shadowRoot?.querySelector('.modal-content') as HTMLElement;
          if (modalContent) {
            modalContent.focus();
          }
        });
      } else {
        // Modal closed
        document.body.style.overflow = '';
        document.removeEventListener('keydown', this.handleKeyDown);
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  render() {
    if (!this.open) return html``;

    return html`
      <div class="modal-overlay" @click="${this.handleOverlayClick}">
        <div class="modal-content" @click="${this.handleContentClick}" tabindex="-1">
          ${this.title || this.showClose
            ? html`
                <div class="modal-header">
                  <h3 class="modal-title">${this.title}</h3>
                  ${this.showClose
                    ? html`
                        <unzer-button
                          variant="ghost"
                          size="small"
                          icon-only
                          @button-click="${this.closeModal}"
                          aria-label="${this.t('shared.modal.closeAriaLabel')}"
                          >×</unzer-button
                        >
                      `
                    : ''}
                </div>
              `
            : ''}

          <div class="modal-body">
            <slot></slot>
          </div>

          <div class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-modal': UnzerModal;
  }
}
