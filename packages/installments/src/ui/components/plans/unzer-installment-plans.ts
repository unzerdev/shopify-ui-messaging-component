import { CSSResultGroup, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { ConfigObject } from '@unzer/messaging-core';
import { UnzerElement } from '@unzer/messaging-core';
import { logger } from '@unzer/messaging-core';
import { cssText } from '@unzer/messaging-core';
import {
  GetInstallmentPlansResponse,
  GetInstallmentPlansRequest,
} from '../../../application/dto';
import { _di } from '@unzer/messaging-core';
import { IInstallmentController } from '../../../infrastructure/di/installments-di.js';
import installmentPlansStylesContent from './styles/installment-plans.css?inline';
import shadowsStylesContent from '@unzer/messaging-core/src/infrastructure/ui/styles/shadows.css?inline';
import { installmentVariablesStyles } from '../../../styling/shared-styles.js';
import '../plan/unzer-installment-plan.js';
import '../navigation/unzer-navigation.js';
import '../details/unzer-installment-details.js';
import { generateDemoPlans } from './mock/demo-plans.js';
// Core shared components (unzer-modal, unzer-button, unzer-auto-widget) are registered by @unzer/messaging-core
import { ModalManager, ModalConfig } from './managers/modal-manager.js';
import { PlansRenderer } from './renderers/plans-renderer.js';
import { INSTALLMENT_DEFAULTS } from '../../../config/installment-defaults.js';
import { IMessagingApiHelper } from '@unzer/messaging-core';
import type { MessagingApiHelper } from '@unzer/messaging-core';
import type { WidgetStyles } from '@unzer/messaging-core';
import type { UnzerInstallmentsConfig } from '../../../types/installment-types.js';
import type { InstallmentError, InstallmentErrorCode } from '../../../types/installment-error-types.js';
import { COUNTRIES, CURRENCIES } from '../../../types/installment-types.js';

/**
 * A custom web component representing a dynamic installment payment widget supported by Unzer's API.
 * This widget allows users to display and interact with installment payment plans based on various configurations and inputs.
 *
 * The component is designed for flexibility and supports properties to configure its appearance, functionality, and integration with the Unzer API.
 * It dynamically fetches installment plans based on provided parameters and renders relevant UI elements for user interaction.
 */
@customElement('unzer-installments-widget')
export class UnzerInstallmentsWidget extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      ...(super.styles instanceof Array ? super.styles : [super.styles]),
      installmentVariablesStyles,
      cssText(shadowsStylesContent + installmentPlansStylesContent)
    ];
  }

  // ===========================================
  // CORE PROPERTIES
  // ===========================================

  /** The Unzer API public key */
  @property({ type: String, attribute: 'public-key' })
  publicKey = '';

  /** The API base URL */
  @property({ type: String, attribute: 'api-url' })
  apiUrl = 'https://sbx-api.unzer.com/v1';

  /** Purchase amount for installment calculation */
  @property({ type: Number, attribute: 'amount' })
  amount: number = INSTALLMENT_DEFAULTS.amount.defaultValue;

  /** Currency code (ISO 4217) */
  @property({ type: String, attribute: 'currency' })
  currency = 'EUR';

  /** Country code (ISO 3166-1 alpha-2) */
  @property({ type: String, attribute: 'country' })
  country = 'DE';

  /** Customer type for installment calculation */
  @property({ type: String, attribute: 'customer-type' })
  customerType: 'B2C' | 'B2B' = 'B2C';

  /** Layout mode for plan display */
  @property({ type: String, attribute: 'installment-layout' })
  installmentLayout: 'buttons' | 'arrows' | 'select' | 'text' | '' = 'buttons';

  /** Logo display mode */
  @property({ type: String, attribute: 'unzer-logo-display' })
  unzerLogoDisplay: 'unzer-logo' | 'icon' | 'pm-logo' | '' = 'unzer-logo';

  /** Logo position: left or right */
  @property({ type: String, attribute: 'unzer-logo-position' })
  unzerLogoPosition: 'left' | 'right' = 'right';

  /** Whether to show the payment timeline */
  @property({ type: Boolean, attribute: 'show-timeline' })
  showTimeline = true;

  /** Demo mode: show mock data without API key */
  @property({ type: Boolean, attribute: 'demo' })
  demo = false;

  /** Preview mode: when true (default), show error banners in UI; when false, render nothing and log to console */
  @property({ type: Boolean, attribute: 'preview-mode' })
  previewMode = true;

  /** Info button layout: icon or link */
  @property({ type: String, attribute: 'info-button-layout' })
  infoButtonLayout: 'icon' | 'link' | '' = 'icon';

  // ===========================================
  // AUTO-RENDERING PROPERTIES (for embedded auto-widget)
  // ===========================================

  /** CSS selector to extract amount from DOM element */
  @property({ type: String, attribute: 'amount-selector' })
  amountSelector?: string;

  /** CSS selector for the root element where this component should be rendered */
  @property({ type: String, attribute: 'root-selector' })
  rootSelector?: string;

  /** CSS selector for parent container */
  @property({ type: String, attribute: 'parent-selector' })
  parentSelector?: string;

  // ===========================================
  // SPEC API PROPERTIES
  // ===========================================

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
      fromAttribute: (value: string | null): UnzerInstallmentsConfig => {
        if (!value) return {} as UnzerInstallmentsConfig;
        try { return JSON.parse(value); } catch { return {} as UnzerInstallmentsConfig; }
      }
    }
  })
  paymentMethodConfig: UnzerInstallmentsConfig = {} as UnzerInstallmentsConfig;

  @property({ type: Boolean, attribute: 'show-border' })
  showBorder = true;

  @property({ type: String, attribute: 'info-icon-color' })
  infoIconColor = '#707070';

  @property({ type: String, attribute: 'info-link-color' })
  infoLinkColor = '#F21C58';

  @property({ type: String, attribute: 'info-link-text' })
  infoLinkText = '';

  @property({ type: String, attribute: 'default-installment-button-color' })
  defaultInstallmentButtonColor = '#9C9C9C';

  @property({ type: String, attribute: 'selected-installment-button-color' })
  selectedInstallmentButtonColor = '#F21C58';

  @property({ type: String, attribute: 'installments-navigational-arrows-color' })
  installmentsNavigationalArrowsColor = '#F21C58';

  // ===========================================
  // STATE
  // ===========================================

  @state()
  private loading = false;

  @state()
  private error: InstallmentError | null = null;

  @state()
  private plansData: GetInstallmentPlansResponse | null = null;

  @state()
  private selectedPlanIndex: number | null = null;

  @state()
  private currentPlanIndex: number = 0;



  // ===========================================
  // PRIVATE PROPERTIES
  // ===========================================

  private modalManager?: ModalManager;
  private plansRenderer?: PlansRenderer;
  private loadPlansTimeout?: number;
  private autoWidget?: HTMLElement;
  private resizeObserver?: ResizeObserver;
  private observedElements = new Set<Element>();

  private _messagingHelper?: MessagingApiHelper;
  private get _messaging(): MessagingApiHelper {
    if (!this._messagingHelper) {
      this._messagingHelper = _di(IMessagingApiHelper);
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

  // ===========================================
  // LIFECYCLE
  // ===========================================

  connectedCallback() {
    super.connectedCallback();
    this._messaging.captureInputs(this, () => this._getSpecInputs());

    // Initialize components
    this.initializeComponents();
    this.setupResizeObserver();

    if (this.demo || this.publicKey) {
      this.loadPlans();
    }
  }

  disconnectedCallback() {
    this._messaging.emitDestroy(this, 'installments', 'dom-removal', () => this._getSpecInputs());
    super.disconnectedCallback();

    // Cleanup
    this.modalManager?.destroy();

    // Remove auto-widget if created
    if (this.autoWidget) {
      this.autoWidget.remove();
      this.autoWidget = undefined;
    }

    if (this.loadPlansTimeout) {
      clearTimeout(this.loadPlansTimeout);
      this.loadPlansTimeout = undefined;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
      this.observedElements.clear();
    }
  }



  // ===========================================
  // INITIALIZATION
  // ===========================================

  private initializeComponents(): void {
    this.modalManager = new ModalManager(this.getModalConfig(), this);
    this.plansRenderer = new PlansRenderer();
  }

  private getModalConfig(): ModalConfig {
    return {
      title: this.t('installments.plans.modalTitle'),
      styleConfig: {},
    };
  }

  // ===========================================
  // API LOADING
  // ===========================================

  private async loadPlans() {
    if (!this.demo && !this.publicKey) {
      this.error = { code: 'AUTH_ERROR', technicalMessage: 'Public key is required' };
      return;
    }

    if (this.amount === null || this.amount === undefined) {
      logger.info('Skipping load - no amount set', 'UnzerInstallmentsWidget');
      return;
    }

    if (this.amount <= 0) {
      this.error = { code: 'AMOUNT_ERROR', technicalMessage: `Invalid amount: ${this.amount}` };
      return;
    }

    if (!COUNTRIES.includes(this.country as typeof COUNTRIES[number])) {
      this.error = { code: 'VALIDATION_ERROR', technicalMessage: `Unsupported country: ${this.country}. Allowed: ${COUNTRIES.join(', ')}` };
      return;
    }

    if (!CURRENCIES.includes(this.currency as typeof CURRENCIES[number])) {
      this.error = { code: 'VALIDATION_ERROR', technicalMessage: `Unsupported currency: ${this.currency}. Allowed: ${CURRENCIES.join(', ')}` };
      return;
    }

    // Show loading state immediately
    this.loading = true;

    // Debounce
    if (this.loadPlansTimeout) {
      clearTimeout(this.loadPlansTimeout);
    }

    this.loadPlansTimeout = window.setTimeout(async () => {
      await this.doLoadPlans();
    }, 300);
  }

  private async doLoadPlans() {
    // Demo mode: use mock data without API call
    if (this.demo) {
      this.loading = true;
      this.error = null;
      this.plansData = generateDemoPlans(this.amount, this.currency);
      this.loading = false;
      return;
    }

    const request: GetInstallmentPlansRequest = {
      amount: this.amount,
      currency: this.currency,
      country: this.country,
      customerType: this.customerType,
      publicKey: this.publicKey,
    };

    this.loading = true;
    this.error = null;

    try {

      // Controller handles all caching and duration logic
      const response = await _di(IInstallmentController).getInstallmentPlans(request);

      if (!response.success || !response.data) {
        const errorCode = (response.error || 'UNKNOWN_ERROR') as InstallmentErrorCode;
        this.error = { code: errorCode, technicalMessage: response.error || 'Failed to fetch installment plans' };

        this.emit('unzer-plans-error', {
          error: this.error,
          code: this.error.code,
        });

        this._messaging.emitError(this, 'installments', this.error.code, this.error.technicalMessage, 'api', () => this._getSpecInputs());
        return;
      }

      // Simply assign the data - controller already handles conversion
      this.plansData = response.data;

      this.emit('unzer-plans-loaded', {
        plans: response.data.plans || [],
        totalCount: response.data.plans?.length || 0,
        fromCache: false,
      });

      this._messaging.emitReady(this, 'installments', {
        planCount: response.data.plans?.length || 0,
      }, () => this._getSpecInputs());

    } catch (error) {
      this.error = { code: 'UNKNOWN_ERROR', technicalMessage: error instanceof Error ? error.message : 'Unknown error' };

      this.emit('unzer-plans-error', {
        error: this.error,
        code: this.error.code,
      });

      this._messaging.emitError(this, 'installments', this.error.code, this.error.technicalMessage, 'api', () => this._getSpecInputs());
    } finally {
      this.loading = false;
    }
  }

  // ===========================================
  // EVENT HANDLERS
  // ===========================================

  private selectPlan(planIndex: number) {
    this.currentPlanIndex = planIndex;

    if (this.plansData?.plans) {
      const selectedPlan = this.plansData.plans[planIndex];
      this.emit('unzer-plan-select', {
        plan: selectedPlan,
        index: planIndex,
      });
    }
  }

  private toggleDetails(): void {
    this.openInstallmentDetailsModal();
  }

  private openInstallmentDetailsModal(): void {
    if (!this.plansData?.plans || this.currentPlanIndex === null || this.currentPlanIndex < 0) return;

    const selectedPlan = this.plansData.plans[this.currentPlanIndex];
    if (!selectedPlan) return;

    // Get current configuration to ensure timeline setting is up to date
    const config = this.buildPlansConfig();
    const showTimelineValue = config.showTimeline;

    const modalContent: { contentHTML: string; onContentReady?: (modalWrapper: HTMLElement) => void } = {
      contentHTML: `
        <unzer-installment-details
          show-timeline="${showTimelineValue}">
        </unzer-installment-details>
      `,
      onContentReady: (modalWrapper: HTMLElement) => {
        // Propagate background color to modal content area
        const modal = modalWrapper.querySelector('unzer-modal') as HTMLElement | null;
        if (modal) {
          const bg = getComputedStyle(this).getPropertyValue('--unzer-installments-background-color').trim();
          if (bg) {
            modal.style.setProperty('--modal-content-bg', bg);
          }
        }

        // Set up the installment details component with data
        const detailsComponent = modalWrapper.querySelector('unzer-installment-details') as HTMLElement & {
          plans?: unknown;
          selectedPlan?: unknown;
          amount?: unknown;
          currency?: unknown;
          styleConfig?: unknown;
          showTimeline?: unknown;
          unzerLogoDisplay?: string;
          locale?: string;
        };

        if (detailsComponent) {
          detailsComponent.plans = this.plansData?.plans || [];
          detailsComponent.selectedPlan = selectedPlan;
          detailsComponent.amount = this.amount;
          detailsComponent.currency = this.plansData?.requestCurrency || 'EUR';
          detailsComponent.unzerLogoDisplay = this.unzerLogoDisplay;
          detailsComponent.styleConfig = {};
          detailsComponent.locale = this.locale;

          // Ensure timeline setting is correctly applied
          const currentConfig = this.buildPlansConfig();
          detailsComponent.showTimeline = currentConfig.showTimeline;

          detailsComponent.addEventListener('plan-change', (e: Event) => {
            if (e instanceof CustomEvent) {
              this.handlePlanChange(e);
            }
          });
        }
      }
    };

    this.selectedPlanIndex = this.currentPlanIndex;
    
    // Modal manager will automatically detect preview mode and use device container
    this.modalManager?.openModal(modalContent, () => {
      this.closeModal();
    });
  }

  private handlePlanChange(event: CustomEvent): void {
    // Handle plan change from modal
    const planIndex = event.detail?.index;
    if (typeof planIndex === 'number' && planIndex >= 0) {
      this.currentPlanIndex = planIndex;
    }
  }

  private closeModal() {
    this.selectedPlanIndex = null;
  }

  // ===========================================
  // UTILITY METHODS
  // ===========================================

  private setupResizeObserver(): void {
    if (this.resizeObserver) return;
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        const overflowing = el.scrollWidth > el.clientWidth;
        el.classList.toggle('scroll-needed', overflowing);
        el.classList.toggle('no-scroll', !overflowing);
      }
    });
  }

  private observeNavigationElements(): void {
    if (!this.resizeObserver) return;
    const navEls = this.shadowRoot?.querySelectorAll('.plan-buttons, .plan-arrows, .plan-select');
    for (const el of this.observedElements) {
      if (!el.isConnected) {
        this.resizeObserver.unobserve(el);
        this.observedElements.delete(el);
      }
    }
    navEls?.forEach(el => {
      if (!this.observedElements.has(el)) {
        this.resizeObserver!.observe(el);
        this.observedElements.add(el);
      }
    });
  }

  private buildPlansConfig(): ConfigObject {
    return {
      publicKey: this.publicKey,
      amount: this.amount,
      currency: this.currency || INSTALLMENT_DEFAULTS.defaultCurrency,
      country: this.country || INSTALLMENT_DEFAULTS.defaultCountry,
      customerType: this.customerType || INSTALLMENT_DEFAULTS.defaultCustomerType,
      installmentLayout: this.installmentLayout || '',
      unzerLogoDisplay: this.unzerLogoDisplay || '',
      unzerLogoPosition: this.unzerLogoPosition || 'right',
      showTimeline: this.showTimeline !== undefined ? this.showTimeline : true,
      infoButtonLayout: this.infoButtonLayout ?? 'icon',
      infoLinkText: this.infoLinkText ?? '',
      demo: this.demo,
      autoRender: false,
      locale: this.locale
    };
  }

  // ===========================================
  // RENDERING
  // ===========================================

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    // Hide host completely when in non-preview error/empty state
    const hasVisibleError = !this.previewMode && (this.error || (this.plansData?.success && !this.plansData.plans?.length));
    this.toggleAttribute('hidden-error', !!hasVisibleError);

    // If showTimeline property changed and modal is open, close and reopen modal
    if (changedProperties.has('showTimeline') && this.selectedPlanIndex !== null) {
      this.modalManager?.closeModal();
      // Small delay to ensure modal is closed before reopening
      setTimeout(() => {
        this.openInstallmentDetailsModal();
      }, 100);
    }

    // Apply showBorder
    if (changedProperties.has('showBorder')) {
      this.style.setProperty('--unzer-installments-border-width', this.showBorder ? '' : '0');
    }

    // Reload plans if key properties change
    if (changedProperties.has('demo')) {
      this.loadPlans();
    } else if (
      changedProperties.has('publicKey') ||
      changedProperties.has('apiUrl') ||
      changedProperties.has('amount') ||
      changedProperties.has('currency') ||
      changedProperties.has('country') ||
      changedProperties.has('customerType')
    ) {
      this.loadPlans();
    }

    // Observe navigation elements for scroll overflow (async via ResizeObserver)
    if (changedProperties.has('plansData') || changedProperties.has('installmentLayout')) {
      this.observeNavigationElements();
    }

    // Apply widgetStyles if changed
    if (changedProperties.has('widgetStyles') && this.widgetStyles) {
      this._messaging.applyWidgetStyles(this, this.widgetStyles, 'installments');
      const mappings = this._messaging.getStyleMappings(this.widgetStyles);
      if (mappings?.unzerLogoDisplay !== undefined) this.unzerLogoDisplay = mappings.unzerLogoDisplay as 'unzer-logo' | 'icon' | 'pm-logo' | '';
      if (mappings?.unzerLogoPosition !== undefined) this.unzerLogoPosition = mappings.unzerLogoPosition as 'left' | 'right';
      if (mappings?.infoButtonLayout !== undefined) this.infoButtonLayout = mappings.infoButtonLayout as 'icon' | 'link' | '';
      if (mappings?.infoLinkText) this.infoLinkText = mappings.infoLinkText;
    }

    // Apply paymentMethodConfig if changed
    if (changedProperties.has('paymentMethodConfig') && this.paymentMethodConfig) {
      const cfg = this.paymentMethodConfig;
      if (cfg.publicKey) this.publicKey = cfg.publicKey;
      if (cfg.installmentLayout) this.installmentLayout = cfg.installmentLayout;
      if (cfg.showTimeline !== undefined) this.showTimeline = cfg.showTimeline;
      if (cfg.defaultInstallmentButtonColor) {
        this.defaultInstallmentButtonColor = cfg.defaultInstallmentButtonColor;
        this.style.setProperty('--unzer-installments-default-button-color', cfg.defaultInstallmentButtonColor);
      }
      if (cfg.selectedInstallmentButtonColor) {
        this.selectedInstallmentButtonColor = cfg.selectedInstallmentButtonColor;
        this.style.setProperty('--unzer-installments-selected-button-color', cfg.selectedInstallmentButtonColor);
      }
      if (cfg.installmentsNavigationalArrowsColor) {
        this.installmentsNavigationalArrowsColor = cfg.installmentsNavigationalArrowsColor;
        this.style.setProperty('--unzer-installments-arrows-color', cfg.installmentsNavigationalArrowsColor);
      }
    }
  }

  // ===========================================
  // PUBLIC SETTERS
  // ===========================================

  // General setters
  setAmount(amount: number): void { this.amount = amount; }
  setCurrency(currency: string): void { this.currency = currency; }
  setCountry(country: string): void { this.country = country; }
  setLocale(locale: string): void { this.locale = locale; }
  setWidgetStyles(styles: WidgetStyles): void { this.widgetStyles = { ...this.widgetStyles, ...styles }; }
  setPaymentMethodConfig(config: Partial<UnzerInstallmentsConfig>): void { this.paymentMethodConfig = { ...this.paymentMethodConfig, ...config } as UnzerInstallmentsConfig; }

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
  setInfoLinkText(v: string): void { this.setWidgetStyles({ infoLinkText: v }); }

  // Installments-specific setters
  setPublicKey(v: string): void { this.setPaymentMethodConfig({ publicKey: v }); }
  setInstallmentLayout(v: 'buttons' | 'arrows' | 'select'): void { this.setPaymentMethodConfig({ installmentLayout: v }); }
  setDefaultInstallmentButtonColor(v: string): void { this.setPaymentMethodConfig({ defaultInstallmentButtonColor: v }); }
  setSelectedInstallmentButtonColor(v: string): void { this.setPaymentMethodConfig({ selectedInstallmentButtonColor: v }); }
  setInstallmentsNavigationalArrowsColor(v: string): void { this.setPaymentMethodConfig({ installmentsNavigationalArrowsColor: v }); }
  setShowTimeline(v: boolean): void { this.setPaymentMethodConfig({ showTimeline: v }); }
  setPreviewMode(v: boolean): void { this.previewMode = v; }

  // ===========================================
  // RENDERING
  // ===========================================

  render() {
    // Don't render if we're in mode without data
    if (this.amountSelector && !this.amount) {
      return null;
    }


    // First load — show blurred placeholder until data arrives
    if (this.loading && !this.plansData?.plans?.length) {
      return html`
        <div class="plans-container is-loading">
          <div class="navigation-area">
            <div class="loading-placeholder"></div>
          </div>
        </div>
      `;
    }

    // Error state
    if (this.error) {
      if (!this.previewMode) {
        logger.warn(`Installments widget error: [${this.error.code}] ${this.error.technicalMessage}`, 'UnzerInstallmentsWidget');
        return null;
      }
      return this.plansRenderer?.renderErrorState(this.error, (key: string) => this.t(key));
    }

    // No data or empty plans
    if (!this.plansData || !this.plansData.plans?.length) {
      if (this.plansData?.success) {
        if (!this.previewMode) {
          logger.warn('Installments widget: No plans returned from API', 'UnzerInstallmentsWidget');
          return null;
        }
        return this.plansRenderer?.renderErrorState(
          { code: 'NO_PLANS', technicalMessage: 'No plans returned from API' },
          (key: string) => this.t(key)
        );
      }
      return null;
    }

    // Build config
    const config = this.buildPlansConfig();

    // Render plans - CSS variables applied to :host element
    return html`
      ${this.plansRenderer?.renderPlansContent(
        config,
        this.plansData,
        (index: number) => this.selectPlan(index),
        () => this.toggleDetails(),
        this.currentPlanIndex,
        this.loading
      )}
    `;
  }
}

/** @deprecated Use UnzerInstallmentsWidget instead */
export { UnzerInstallmentsWidget as UnzerInstallmentPlans };

declare global {
  interface HTMLElementTagNameMap {
    'unzer-installments-widget': UnzerInstallmentsWidget;
  }
}
