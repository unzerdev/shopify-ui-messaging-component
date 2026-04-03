/**
 * Code Preview Template for Invoice Widget
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
    if (c.fontSize && c.fontSize !== 14) widgetStyles.fontSize = c.fontSize;
    if (c.fontWeight && c.fontWeight !== 400) widgetStyles.fontWeight = c.fontWeight;
    if (c.fontFamily && c.fontFamily !== 'Arial, sans-serif') widgetStyles.fontFamily = c.fontFamily;
    if (c.textColor && c.textColor !== '#2D2D2D') widgetStyles.textColor = c.textColor;
    if (c.backgroundColor && c.backgroundColor !== '#FFFFFF') widgetStyles.backgroundColor = c.backgroundColor;
    if (c.borderColor && c.borderColor !== '#E0E0E0') widgetStyles.borderColor = c.borderColor;
    if (c.borderRadius && c.borderRadius !== 8) widgetStyles.borderRadius = c.borderRadius;
    if (c.borderWidth && c.borderWidth !== 1) widgetStyles.borderWidth = c.borderWidth;
    if (c.showBorder === false) widgetStyles.showBorder = false;

    // Build attributes
    const attrs: string[] = [];
    if (c.locale && c.locale !== 'en') attrs.push(`  locale="${c.locale}"`);
    if (c.expiryDays && c.expiryDays !== 14) attrs.push(`  expiry-days="${c.expiryDays}"`);
    if (Object.keys(widgetStyles).length > 0) {
      attrs.push(`  widget-styles='${JSON.stringify(widgetStyles)}'`);
    }

    return `<unzer-invoice-widget\n${attrs.join('\n')}\n>\n</unzer-invoice-widget>`;
  }
}
