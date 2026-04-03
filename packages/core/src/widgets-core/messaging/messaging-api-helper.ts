/**
 * MessagingApiHelper — Shared spec-API logic for messaging widgets
 *
 * Provides lifecycle event dispatch, widget ID generation, inputs tracking,
 * and WidgetStyles CSS variable application. Used via DI composition
 * by widgets.
 */

import { LitElement } from 'lit';
import { InterfaceConstructor } from '../../infrastructure';
import { logger } from '../../infrastructure/logging/logger.js';
import type { WidgetStyles, MessagingErrorCode } from '../types/widget-styles.js';
import { WIDGET_STYLES_CSS_MAP } from '../types/widget-styles.js';

// ==========================================
// DI TOKEN
// ==========================================

export const IMessagingApiHelper = {} as InterfaceConstructor<MessagingApiHelper>;

// ==========================================
// TYPES
// ==========================================

export interface StyleMappings {
  unzerLogoDisplay?: string;
  unzerLogoPosition?: string;
  infoButtonLayout?: string;
  infoLinkText?: string;
}

// ==========================================
// HELPER CLASS
// ==========================================

export class MessagingApiHelper {

  // ==========================================
  // WIDGET ID
  // ==========================================

  private _generatedIds = new WeakMap<LitElement, string>();

  getWidgetId(host: LitElement, paymentMethod: string): string {
    if (host.id) return host.id;
    let generated = this._generatedIds.get(host);
    if (!generated) {
      generated = `unzer-${paymentMethod}-${Math.random().toString(36).slice(2, 11)}`;
      this._generatedIds.set(host, generated);
    }
    return generated;
  }

  // ==========================================
  // INPUTS TRACKING
  // ==========================================

  private _previousInputs = new WeakMap<LitElement, Record<string, unknown>>();

  captureInputs(host: LitElement, getInputs: () => Record<string, unknown>): void {
    this._previousInputs.set(host, getInputs());
  }

  getPreviousInputs(host: LitElement): Record<string, unknown> | null {
    return this._previousInputs.get(host) ?? null;
  }

  // ==========================================
  // SPEC EVENT DISPATCH
  // ==========================================

  emitReady(
    host: LitElement,
    paymentMethod: string,
    meta: Record<string, unknown>,
    getInputs: () => Record<string, unknown>
  ): void {
    host.dispatchEvent(new CustomEvent('unzer-messaging-widget:ready', {
      bubbles: true,
      composed: true,
      detail: {
        widgetId: this.getWidgetId(host, paymentMethod),
        paymentMethod,
        inputs: getInputs(),
        meta,
      },
    }));
    logger.info('Widget ready', 'MessagingApiHelper', {
      widgetId: this.getWidgetId(host, paymentMethod),
      paymentMethod,
    });
  }

  emitError(
    host: LitElement,
    paymentMethod: string,
    code: MessagingErrorCode,
    message: string,
    reason: 'validation' | 'network' | 'api' | 'render',
    getInputs: () => Record<string, unknown>
  ): void {
    host.dispatchEvent(new CustomEvent('unzer-messaging-widget:error', {
      bubbles: true,
      composed: true,
      detail: {
        widgetId: this.getWidgetId(host, paymentMethod),
        paymentMethod,
        code,
        message,
        reason,
        inputs: getInputs(),
      },
    }));
    logger.warn('Widget error', 'MessagingApiHelper', {
      widgetId: this.getWidgetId(host, paymentMethod),
      code,
      message,
      reason,
    });
  }

  emitUpdate(
    host: LitElement,
    paymentMethod: string,
    updatedAttributes: string[],
    getInputs: () => Record<string, unknown>
  ): void {
    const previousInputs = this.getPreviousInputs(host);
    host.dispatchEvent(new CustomEvent('unzer-messaging-widget:update', {
      bubbles: true,
      composed: true,
      detail: {
        widgetId: this.getWidgetId(host, paymentMethod),
        paymentMethod,
        inputs: getInputs(),
        previousInputs,
        meta: { updatedAttributes },
      },
    }));
    this.captureInputs(host, getInputs);
  }

  emitDestroy(
    host: LitElement,
    paymentMethod: string,
    reason: 'dom-removal' | 'manual',
    getInputs: () => Record<string, unknown>
  ): void {
    host.dispatchEvent(new CustomEvent('unzer-messaging-widget:destroy', {
      bubbles: true,
      composed: true,
      detail: {
        widgetId: this.getWidgetId(host, paymentMethod),
        paymentMethod,
        inputs: getInputs(),
        reason,
      },
    }));
  }

  // ==========================================
  // WIDGET STYLES → CSS VARIABLES
  // ==========================================

  applyWidgetStyles(host: HTMLElement, styles: WidgetStyles, cssPrefix: string): void {
    if (!styles) return;

    // showBorder: false → border-width: 0
    if (styles.showBorder === false) {
      host.style.setProperty(`--unzer-${cssPrefix}-border-width`, '0');
    }

    // CSS variable mappings
    for (const [key, config] of Object.entries(WIDGET_STYLES_CSS_MAP)) {
      const value = styles[key as keyof WidgetStyles];
      if (value !== undefined) {
        if (key === 'borderWidth' && styles.showBorder === false) continue;
        const cssValue = config.unit ? `${value}${config.unit}` : String(value);
        host.style.setProperty(`--unzer-${cssPrefix}-${config.suffix}`, cssValue);
      }
    }
  }

  /**
   * Returns property-level mappings from WidgetStyles.
   * The widget applies these to its own properties.
   */
  getStyleMappings(styles: WidgetStyles): StyleMappings {
    const mappings: StyleMappings = {};
    if (styles.unzerLogoDisplay !== undefined) mappings.unzerLogoDisplay = styles.unzerLogoDisplay;
    if (styles.unzerLogoPosition !== undefined) mappings.unzerLogoPosition = styles.unzerLogoPosition;
    if (styles.infoButtonLayout !== undefined) mappings.infoButtonLayout = styles.infoButtonLayout;
    if (styles.infoLinkText !== undefined) mappings.infoLinkText = styles.infoLinkText;
    return mappings;
  }
}

