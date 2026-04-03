import { html, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { UnzerElement } from '../../../base/unzer-element.js';
import { cssText } from '../../../utils/css-utils.js';
import dragZoneStylesContent from './styles/drag-zone.css?inline';

/**
 * @summary Drag and drop zone component
 * @description
 * A flexible drag zone that accepts dragged items and provides visual feedback.
 *
 * @example
 * ```html
 * <unzer-drag-zone
 *   @item-dropped="${this.handleDrop}"
 *   @drag-over="${this.handleDragOver}"
 *   @drag-enter="${this.handleDragEnter}"
 *   @drag-leave="${this.handleDragLeave}">
 *   <div slot="content">Drop items here</div>
 *   <div slot="overlay">Release to add</div>
 * </unzer-drag-zone>
 * ```
 *
 * @fires item-dropped - Emitted when item is dropped with detail: { itemType, originalEvent }
 * @fires drag-over - Emitted during drag over
 * @fires drag-enter - Emitted when drag enters zone
 * @fires drag-leave - Emitted when drag leaves zone
 */
@customElement('unzer-drag-zone')
export class UnzerDragZone extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cssText(dragZoneStylesContent)
    ];
  }

  /**
   * Whether to show the overlay when dragging
   */
  @property({ type: Boolean, attribute: 'show-overlay' })
  showOverlay = true;

  /**
   * Custom overlay message
   */
  @property({ type: String, attribute: 'overlay-message' })
  overlayMessage = 'Drop here to add';

  /**
   * Overlay icon (can be emoji or text)
   */
  @property({ type: String, attribute: 'overlay-icon' })
  overlayIcon = '📋';

  /**
   * Accepted drop types (comma-separated)
   */
  @property({ type: String, attribute: 'accept-types' })
  acceptTypes = '';

  /**
   * Track added items
   */
  @property({ type: Array })
  addedItems: string[] = [];

  @state()
  private isDragOver = false;

  @state()
  private isDragging = false;

  connectedCallback() {
    super.connectedCallback();

    // Listen for global drag events to show/hide overlay
    document.addEventListener('dragstart', this.handleGlobalDragStart);
    document.addEventListener('dragend', this.handleGlobalDragEnd);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('dragstart', this.handleGlobalDragStart);
    document.removeEventListener('dragend', this.handleGlobalDragEnd);
  }

  private handleGlobalDragStart = () => {
    this.isDragging = true;
  };

  private handleGlobalDragEnd = () => {
    this.isDragging = false;
    this.isDragOver = false;
  };

  private handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }

    this.emit('drag-over', { originalEvent: event });
  };

  private handleDragEnter = (event: DragEvent) => {
    event.preventDefault();
    this.isDragOver = true;
    this.emit('drag-enter', { originalEvent: event });
  };

  private handleDragLeave = (event: DragEvent) => {
    // Only trigger when actually leaving the drop zone
    if (
      event.currentTarget &&
      !(event.currentTarget as Element).contains(event.relatedTarget as Node)
    ) {
      this.isDragOver = false;
      this.emit('drag-leave', { originalEvent: event });
    }
  };

  private handleDrop = (event: DragEvent) => {
    event.preventDefault();
    this.isDragOver = false;

    const itemType = event.dataTransfer?.getData('text/plain') || '';

    // Check if item type is accepted
    if (this.acceptTypes) {
      const accepted = this.acceptTypes.split(',').map(t => t.trim());
      if (!accepted.includes(itemType)) {
        return;
      }
    }

    // Add to added items if not already present
    if (!this.addedItems.includes(itemType)) {
      this.addedItems = [...this.addedItems, itemType];
    }

    this.emit('item-dropped', {
      itemType,
      addedItems: this.addedItems,
      originalEvent: event,
    });
  };

  /**
   * Remove item from added items list
   */
  removeItem(itemType: string) {
    this.addedItems = this.addedItems.filter(item => item !== itemType);
    this.emit('item-removed', {
      itemType,
      addedItems: this.addedItems,
    });
  }

  /**
   * Check if item is in the zone
   */
  hasItem(itemType: string): boolean {
    return this.addedItems.includes(itemType);
  }

  render() {
    return html`
      <div
        class="drop-zone ${this.isDragOver ? 'drag-over' : ''}"
        @dragover="${this.handleDragOver}"
        @dragenter="${this.handleDragEnter}"
        @dragleave="${this.handleDragLeave}"
        @drop="${this.handleDrop}"
      >
        <slot name="content"></slot>

        ${this.showOverlay && this.isDragging
          ? html`
              <div class="drop-overlay ${this.isDragOver ? 'active' : ''}">
                <div class="drop-message">
                  <div class="drop-icon">${this.overlayIcon}</div>
                  <div class="drop-text">${this.overlayMessage}</div>
                </div>
              </div>
            `
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-drag-zone': UnzerDragZone;
  }
}
