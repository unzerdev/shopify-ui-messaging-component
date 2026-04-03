/**
 * Code Preview Template for Installments Widget
 */
import { WidgetConfig } from '@unzer/messaging-core';

export class CodePreviewTemplate {

  static generateCode(config: WidgetConfig): string {
    const c = config as Record<string, unknown>;

    // Build widget-styles object from styling fields
    const widgetStyles: Record<string, unknown> = {};
    if (c.unzerLogoDisplay) widgetStyles.unzerLogoDisplay = c.unzerLogoDisplay;
    if (c.unzerLogoPosition && c.unzerLogoPosition !== 'right') widgetStyles.unzerLogoPosition = c.unzerLogoPosition;
    if (c.infoButtonLayout) widgetStyles.infoButtonLayout = c.infoButtonLayout;
    if (c.infoIconColor && c.infoIconColor !== '#9E9E9E') widgetStyles.infoIconColor = c.infoIconColor;
    if (c.infoLinkColor && c.infoLinkColor !== '#F21C58') widgetStyles.infoLinkColor = c.infoLinkColor;
    if (c.infoLinkText) widgetStyles.infoLinkText = c.infoLinkText;
    if (c.fontSize && c.fontSize !== 14) widgetStyles.fontSize = c.fontSize;
    if (c.fontWeight && c.fontWeight !== 400) widgetStyles.fontWeight = c.fontWeight;
    if (c.fontFamily && c.fontFamily !== 'Arial, sans-serif') widgetStyles.fontFamily = c.fontFamily;
    if (c.textColor && c.textColor !== '#2D2D2D') widgetStyles.textColor = c.textColor;
    if (c.backgroundColor && c.backgroundColor !== '#FFFFFF') widgetStyles.backgroundColor = c.backgroundColor;
    if (c.borderColor && c.borderColor !== '#E0E0E0') widgetStyles.borderColor = c.borderColor;
    if (c.borderRadius && c.borderRadius !== 3) widgetStyles.borderRadius = c.borderRadius;
    if (c.borderWidth && c.borderWidth !== 1) widgetStyles.borderWidth = c.borderWidth;
    if (c.showBorder === false) widgetStyles.showBorder = false;

    // Build payment-method-config object
    const pmConfig: Record<string, unknown> = {};
    if (config.publicKey) pmConfig.publicKey = config.publicKey;
    if (c.installmentLayout && c.installmentLayout !== 'buttons') pmConfig.installmentLayout = c.installmentLayout;
    if (c.showTimeline === false) pmConfig.showTimeline = false;
    if (c.defaultInstallmentButtonColor && c.defaultInstallmentButtonColor !== '#E0E0E0') pmConfig.defaultInstallmentButtonColor = c.defaultInstallmentButtonColor;
    if (c.selectedInstallmentButtonColor && c.selectedInstallmentButtonColor !== '#F21C58') pmConfig.selectedInstallmentButtonColor = c.selectedInstallmentButtonColor;
    if (c.installmentsNavigationalArrowsColor && c.installmentsNavigationalArrowsColor !== '#F21C58') pmConfig.installmentsNavigationalArrowsColor = c.installmentsNavigationalArrowsColor;

    // Build attributes
    const attrs: string[] = [];
    attrs.push(`  amount="${c.amount ?? 50}"`);
    attrs.push(`  currency="${c.currency ?? 'EUR'}"`);
    attrs.push(`  country="${c.country ?? 'DE'}"`);
    if (c.locale && c.locale !== 'en') attrs.push(`  locale="${c.locale}"`);
    if (Object.keys(widgetStyles).length > 0) {
      attrs.push(`  widget-styles='${JSON.stringify(widgetStyles)}'`);
    }
    if (Object.keys(pmConfig).length > 0) {
      attrs.push(`  payment-method-config='${JSON.stringify(pmConfig)}'`);
    }

    return `<unzer-installments-widget\n${attrs.join('\n')}\n>\n</unzer-installments-widget>`;
  }
}
