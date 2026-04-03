import { CSSResultGroup, html, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UnzerElement } from '@unzer/messaging-core';
import { cssText } from '@unzer/messaging-core';
import invoiceBannerStylesContent from './styles/invoice-banner.css?inline';
import { invoiceVariablesStyles } from '../../../styling/shared-styles.js';
import shadowsStylesContent from '@unzer/messaging-core/src/infrastructure/ui/styles/shadows.css?inline';
import '../info/unzer-invoice-info-button.js';
import '../unzer-logo/unzer-invoice-logo.js';
import '../details/unzer-invoice-details.js';
// Core shared components (unzer-modal) are registered by @unzer/messaging-core
import { ModalManager, ModalConfig } from './managers/modal-manager.js';
import { INVOICE_DEFAULTS } from '../../../config/invoice-defaults.js';
import type { LogoPosition } from '../../../types/invoice-types.js';
import type { WidgetStyles } from '@unzer/messaging-core';
import type { UnzerInvoiceConfig } from '../../../types/invoice-types.js';
import { _di } from '@unzer/messaging-core';
import { logger } from '@unzer/messaging-core';
import { IMessagingApiHelper } from '@unzer/messaging-core';
import type { MessagingApiHelper } from '@unzer/messaging-core';

/**
 * @summary Invoice banner component
 * @description Displays a configurable banner for invoice payment method with info modal.
 *
 * @example
 * ```html
 * <unzer-invoice-widget
 *   layout="buy-now"
 *   info-button-layout="icon"
 *   unzer-logo-display="unzer-logo"
 *   unzer-logo-position="right">
 * </unzer-invoice-widget>
 * ```
 */
@customElement('unzer-invoice-widget')
export class UnzerInvoiceWidget extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      ...(super.styles instanceof Array ? super.styles : [super.styles]),
      invoiceVariablesStyles,
      cssText(shadowsStylesContent + invoiceBannerStylesContent)
    ];
  }

  /** Logo display mode */
  @property({ type: String, attribute: 'unzer-logo-display' })
  unzerLogoDisplay: 'unzer-logo' | 'icon' | 'pm-logo' | '' = 'unzer-logo';

  /** Logo position: left or right */
  @property({ type: String, attribute: 'unzer-logo-position' })
  unzerLogoPosition: LogoPosition = INVOICE_DEFAULTS.logoPosition;

  /** Info button layout: icon or link */
  @property({ type: String, attribute: 'info-button-layout' })
  infoButtonLayout: 'icon' | 'link' | '' = 'icon';

  @property({ type: Number })
  amount = 0;

  @property({ type: String })
  currency = 'EUR';

  @property({ type: String })
  country = 'DE';

  @property({
    type: Object,
    attribute: 'widget-styles',
    converter: {
      fromAttribute: (value: string | null): WidgetStyles => {
        if (!value) return {};
        try { return JSON.parse(value); } catch { return {}; }
      }
    }
  })
  widgetStyles: WidgetStyles = {};

  @property({
    type: Object,
    attribute: 'payment-method-config',
    converter: {
      fromAttribute: (value: string | null): UnzerInvoiceConfig => {
        if (!value) return {};
        try { return JSON.parse(value); } catch { return {}; }
      }
    }
  })
  paymentMethodConfig: UnzerInvoiceConfig = {};

  @property({ type: Boolean, attribute: 'show-border' })
  showBorder = true;

  @property({ type: String, attribute: 'info-icon-color' })
  infoIconColor = '#9E9E9E';

  @property({ type: String, attribute: 'info-link-color' })
  infoLinkColor = '#F21C58';

  /** Number of days the customer has to pay */
  @property({ type: Number, attribute: 'expiry-days' })
  expiryDays = 14;

  /** Preview mode: when true (default), show error banners in UI; when false, render nothing and log to console */
  @property({ type: Boolean, attribute: 'preview-mode' })
  previewMode = true;

  private modalManager?: ModalManager;

  // ==========================================
  // MESSAGING API HELPER (lazy DI)
  // ==========================================

  private _messagingHelper?: MessagingApiHelper | null;
  private get _messaging(): MessagingApiHelper | null {
    if (this._messagingHelper === undefined) {
      try {
        this._messagingHelper = _di(IMessagingApiHelper);
      } catch {
        this._messagingHelper = null;
      }
    }
    return this._messagingHelper;
  }

  private _getSpecInputs(): Record<string, unknown> {
    return {
      amount: this.amount,
      currency: this.currency,
      country: this.country,
      locale: this.locale,
      widgetStyles: { ...this.widgetStyles },
      paymentMethodConfig: { ...this.paymentMethodConfig },
    };
  }

  // ==========================================
  // LIFECYCLE
  // ==========================================

  connectedCallback() {
    super.connectedCallback();
    this.modalManager = new ModalManager(this.getModalConfig(), this);

    this._messaging?.captureInputs(this, () => this._getSpecInputs());
    requestAnimationFrame(() => {
      this._messaging?.emitReady(this, 'invoice', {}, () => this._getSpecInputs());
    });
  }

  disconnectedCallback() {
    this._messaging?.emitDestroy(this, 'invoice', 'dom-removal', () => this._getSpecInputs());
    super.disconnectedCallback();
    this.modalManager?.destroy();
  }

  updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    // Apply widgetStyles if changed
    if (changedProperties.has('widgetStyles') && this.widgetStyles) {
      this._messaging?.applyWidgetStyles(this, this.widgetStyles, 'invoice');
      const mappings = this._messaging?.getStyleMappings(this.widgetStyles);
      if (mappings?.unzerLogoDisplay !== undefined) this.unzerLogoDisplay = mappings.unzerLogoDisplay as 'unzer-logo' | 'icon' | 'pm-logo' | '';
      if (mappings?.unzerLogoPosition !== undefined) this.unzerLogoPosition = mappings.unzerLogoPosition as 'left' | 'right';
      if (mappings?.infoButtonLayout !== undefined) this.infoButtonLayout = mappings.infoButtonLayout as 'icon' | 'link' | '';
    }
  }

  // ==========================================
  // PUBLIC SETTERS
  // ==========================================

  // General setters
  setAmount(amount: number): void { this.amount = amount; }
  setCurrency(currency: string): void { this.currency = currency; }
  setCountry(country: string): void { this.country = country; }
  setLocale(locale: string): void { this.locale = locale; }
  setWidgetStyles(styles: WidgetStyles): void { this.widgetStyles = { ...this.widgetStyles, ...styles }; }
  setPaymentMethodConfig(config: Partial<UnzerInvoiceConfig>): void { this.paymentMethodConfig = { ...this.paymentMethodConfig, ...config }; }

  // WidgetStyles individual setters
  setUnzerLogoDisplay(v: 'unzer-logo' | 'pm-logo' | 'icon' | ''): void { this.setWidgetStyles({ unzerLogoDisplay: v }); }
  setUnzerLogoPosition(v: 'left' | 'right'): void { this.setWidgetStyles({ unzerLogoPosition: v }); }
  setFontFamily(v: string): void { this.setWidgetStyles({ fontFamily: v as WidgetStyles['fontFamily'] }); }
  setFontSize(v: number): void { this.setWidgetStyles({ fontSize: v }); }
  setFontWeight(v: number): void { this.setWidgetStyles({ fontWeight: v }); }
  setTextColor(v: string): void { this.setWidgetStyles({ textColor: v }); }
  setShowBorder(v: boolean): void { this.setWidgetStyles({ showBorder: v }); }
  setBorderColor(v: string): void { this.setWidgetStyles({ borderColor: v }); }
  setBorderRadius(v: number): void { this.setWidgetStyles({ borderRadius: v }); }
  setBorderWidth(v: number): void { this.setWidgetStyles({ borderWidth: v }); }
  setBackgroundColor(v: string): void { this.setWidgetStyles({ backgroundColor: v }); }
  setInfoButtonLayout(v: 'icon' | 'link'): void { this.setWidgetStyles({ infoButtonLayout: v }); }
  setInfoIconColor(v: string): void { this.setWidgetStyles({ infoIconColor: v }); }
  setInfoLinkColor(v: string): void { this.setWidgetStyles({ infoLinkColor: v }); }

  // PaymentMethodConfig setters
  setExpiryDays(v: number): void { this.expiryDays = v; }
  setPreviewMode(v: boolean): void { this.previewMode = v; }

  // ==========================================
  // MODAL
  // ==========================================

  private getModalConfig(): ModalConfig {
    return {
      title: this.t('invoice.banner.modalTitle'),
      styleConfig: {},
    };
  }

  private handleInfoClick() {
    this.openDetailsModal();
  }

  private openDetailsModal(): void {
    const modalContent = {
      contentHTML: `<unzer-invoice-details></unzer-invoice-details>`,
      onContentReady: (modalWrapper: HTMLElement) => {
        // Read all --unzer-invoice-* variables directly from host inline style
        const cssVars = this.collectInlineVariables();

        // Apply to every element in the portal chain so variables
        // are available regardless of Shadow DOM inheritance
        const modal = modalWrapper.querySelector('unzer-modal') as HTMLElement | null;
        const details = modalWrapper.querySelector('unzer-invoice-details') as HTMLElement | null;

        // Propagate locale, expiryDays, and logo config to the details component
        if (details) {
          const d = details as HTMLElement & { locale: string; expiryDays: number; unzerLogoDisplay: string };
          d.locale = this.locale;
          d.expiryDays = this.expiryDays;
          d.unzerLogoDisplay = this.unzerLogoDisplay;
        }

        for (const el of [modalWrapper, modal, details]) {
          if (el) {
            for (const [name, value] of cssVars) {
              el.style.setProperty(name, value);
            }
          }
        }

        // Propagate background color to modal content area
        if (modal) {
          const bg = getComputedStyle(this).getPropertyValue('--unzer-invoice-background-color').trim();
          if (bg) {
            modal.style.setProperty('--modal-content-bg', bg);
          }
          // Keep default modal scroll behavior, only reset body padding
          // so invoice-details handles its own padding
          modal.style.setProperty('--modal-body-padding', '0');
        }
      }
    };

    this.modalManager?.openModal(modalContent, () => {
      /* modal closed */
    });
  }

  /**
   * Read all --unzer-invoice-* CSS variables from the host element's
   * CSSStyleDeclaration. This is the most reliable source because
   * the preview host sets them via the inline style attribute.
   */
  private collectInlineVariables(): Map<string, string> {
    const vars = new Map<string, string>();

    // Iterate the CSSStyleDeclaration — includes custom properties
    for (let i = 0; i < this.style.length; i++) {
      const prop = this.style.item(i);
      if (prop.startsWith('--unzer-invoice-')) {
        const value = this.style.getPropertyValue(prop).trim();
        if (value) {
          vars.set(prop, value);
        }
      }
    }

    return vars;
  }

  // ==========================================
  // RENDERING
  // ==========================================

  private renderLogo() {
    if (!this.unzerLogoDisplay) return '';

    const logoVariant = this.unzerLogoDisplay === 'unzer-logo' ? 'logo' : this.unzerLogoDisplay;

    return html`
      <unzer-invoice-logo
        .variant="${logoVariant}"
        class="${this.unzerLogoPosition === 'left' ? 'logo-left' : ''}"
      ></unzer-invoice-logo>
    `;
  }

  private renderInfoTrigger() {
    if (!this.infoButtonLayout) return '';

    return html`
      <unzer-invoice-info-button
        locale="${this.locale}"
        .variant="${this.infoButtonLayout}"
        .linkText="${this.t('invoice.info.learnMore')}"
        @info-click="${this.handleInfoClick}"
      ></unzer-invoice-info-button>
    `;
  }

  render() {
    try {
      const text = this.t('invoice.banner.buyNow');

      return html`
        <div class="banner-container">
          <span class="banner-label">${text}</span>
          ${this.renderInfoTrigger()}
          ${this.renderLogo()}
        </div>
      `;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown rendering error';
      if (!this.previewMode) {
        logger.warn(`Invoice widget render error: ${message}`, 'UnzerInvoiceWidget');
        return null;
      }
      return html`<div style="color:#e54d4d;padding:8px;font-size:0.85rem;border-left:3px solid #e54d4d;background:#fef8f8;border-radius:4px;">Invoice widget error: ${message}</div>`;
    }
  }
}

// Backward-compatible alias
export { UnzerInvoiceWidget as UnzerInvoiceBanner };

declare global {
  interface HTMLElementTagNameMap {
    'unzer-invoice-widget': UnzerInvoiceWidget;
  }
}
