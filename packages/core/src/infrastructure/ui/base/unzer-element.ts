import { LitElement, CSSResultGroup } from 'lit';
import { property } from 'lit/decorators.js';
import { cssText } from '../utils/css-utils.js';
import baseStylesContent from '../styles/base.css?inline';
import { _di } from '../../container';
import { ILocaleService, type LocaleService } from '../../i18n';

/**
 * Base class for all Unzer components
 */
export class UnzerElement extends LitElement {
  private _diReady = false;

  /**
   * Ensures DI container is ready before running subclass connectedCallback logic.
   * If element is in HTML before bootstrap completes, defers until DI is available.
   */
  connectedCallback() {
    if (!this._diReady) {
      try {
        // Test if DI is ready by resolving LocaleService
        _di(ILocaleService);
        this._diReady = true;
      } catch {
        // DI not ready — retry next frame (after bootstrap completes)
        requestAnimationFrame(() => this.connectedCallback());
        return;
      }
    }
    super.connectedCallback();
  }
  /**
   * The size variant
   */
  @property({ type: String, reflect: true })
  size: 'small' | 'medium' | 'large' | 'xl' | 'compact' = 'medium';

  /**
   * Whether the component is disabled
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Component locale for translations.
   * Set to change the language of this component's UI strings.
   * Default: 'en' (English)
   */
  @property({ type: String, reflect: true })
  locale = 'en';

  // Lazy DI for LocaleService (same pattern as AbstractWidget.cssManager)
  private _localeService?: LocaleService;
  private get localeService(): LocaleService {
    if (!this._localeService) {
      this._localeService = _di(ILocaleService);
    }
    return this._localeService;
  }

  /**
   * Translate a key using this component's locale
   */
  protected t(key: string): string {
    return this.localeService.t(key, this.locale);
  }

  /**
   * Translate a key with parameter interpolation
   * @example this.tParams('table.showing', { start: 1, end: 10, total: 50 })
   */
  protected tParams(key: string, params: Record<string, string | number>): string {
    return this.localeService.tParams(key, this.locale, params);
  }

  static get styles(): CSSResultGroup {
    // Base styles for all Unzer components
    return [
      cssText(baseStylesContent)
    ];
  }

  /**
   * Emit a custom event
   */
  protected emit(name: string, detail?: unknown, options?: CustomEventInit) {
    const event = new CustomEvent(name, {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail,
      ...options,
    });

    this.dispatchEvent(event);
    return event;
  }

  /**
   * Get CSS custom property value
   */
  protected getCSSProperty(property: string): string {
    return getComputedStyle(this).getPropertyValue(property).trim();
  }

  /**
   * Set CSS custom property value
   */
  protected setCSSProperty(property: string, value: string): void {
    this.style.setProperty(property, value);
  }
}
