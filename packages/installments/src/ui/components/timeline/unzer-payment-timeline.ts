import { html, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { ConfigObject } from '@unzer/messaging-core';
import { UnzerElement } from '@unzer/messaging-core';
import { cssText } from '@unzer/messaging-core';
import paymentTimelineStyles from './styles/payment-timeline.css?inline';
import { installmentVariablesStyles } from '../../../styling/shared-styles.js';

/**
 * @summary Payment timeline component
 * @description
 * Displays a timeline of payment dates with different modes:
 * - modal: Centers short timelines (≤4 items), left-aligns longer ones
 * - inline: Always centers timeline with fixed width and scroll when needed
 * - default: Left-aligned timeline
 *
 * @example
 * ```html
 * <!-- Modal mode -->
 * <unzer-payment-timeline
 *   .paymentDates="${dates}"
 *   mode="modal">
 * </unzer-payment-timeline>
 * <!-- Inline mode -->
 * <unzer-payment-timeline
 *   .paymentDates="${dates}"
 *   mode="inline">
 * </unzer-payment-timeline>
 * ```
 */
@customElement('unzer-payment-timeline')
export class UnzerPaymentTimeline extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      super.styles,
      installmentVariablesStyles,
      cssText(paymentTimelineStyles)
    ];
  }

  /**
   * Array of payment dates (ISO strings)
   * @required
   */
  @property({ type: Array })
  paymentDates: string[] = [];

  /** Style configuration object for theming */
  @property({ type: Object })
  styleConfig?: ConfigObject;

  /**
   * Container width to determine layout behavior
   * @internal
   */
  @state()
  private containerWidth = 0;

  // @state()
  // private userIsScrolling = false; // Removed - not used

  private scrollTimeout: ReturnType<typeof setTimeout> | undefined;

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  }

  private getTimelineContainerClass(): string {
    // Calculate estimated content width
    const estimatedContentWidth =
      this.paymentDates.length * 60 + (this.paymentDates.length - 1) * 26; // items + separators

    // If content fits comfortably in container, center it
    if (estimatedContentWidth < this.containerWidth * 0.8) {
      return 'timeline-container centered';
    } else {
      // If content is tight or overflows, use flex-start with scroll
      return 'timeline-container scrollable';
    }
  }

  private handleScroll = () => {
    // Clear existing timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Set timeout to reset scroll state
    this.scrollTimeout = setTimeout(() => {
      // Scroll ended
    }, 150);
  };

  render() {
    if (!this.paymentDates?.length) {
      return html`<div class="no-dates">${this.t('installments.timeline.noPaymentDates')}</div>`;
    }

    const fewItems = this.paymentDates.length <= 3;
    const timelineClass = fewItems ? 'payment-timeline fit-content' : 'payment-timeline';

    return html`
      <div class="${timelineClass}">
        <div class="${this.getTimelineContainerClass()}" @scroll=${this.handleScroll}>
          ${this.paymentDates.map((date, index) => {
            const isFirst = index === 0;
            const isLast = index === this.paymentDates.length - 1;
            return html`
              <div class="timeline-item ${isFirst ? 'active' : ''}">
                <div class="timeline-dot ${isFirst ? 'active' : ''}"></div>
                <div class="timeline-date">${isFirst ? this.t('installments.timeline.today') : this.formatDate(date)}</div>
              </div>
              ${!isLast ? 
                html`<div class="timeline-separator">
                  <span class="dots">• • •</span>
                </div>` : ''}
            `;
          })}
        </div>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    
    // Observe container width changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.containerWidth = entry.contentRect.width;
        this.requestUpdate();
      }
    });
    
    resizeObserver.observe(this);
    
    // Clean up on disconnect
    this.addEventListener('disconnected', () => {
      resizeObserver.disconnect();
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-payment-timeline': UnzerPaymentTimeline;
  }
}