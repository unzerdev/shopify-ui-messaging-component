/**
 * Messaging Widget Types
 * Spec-aligned types for the public messaging widget API.
 */

/**
 * Widget style customization options.
 * All properties have default values — when not specified,
 * default styling configurations will be used.
 */
export interface WidgetStyles {
  /** Display of the Unzer logo on the widget */
  unzerLogoDisplay?: 'unzer-logo' | 'pm-logo' | 'icon' | '';
  /** Logo position */
  unzerLogoPosition?: 'left' | 'right';
  /** Font family from the list of supported fonts */
  fontFamily?: 'Noto Sans' | 'Impact' | 'Charcoal' | 'sans-serif' | 'Roboto' | 'Helvetica' | 'Arial';
  /** Font size in pixels (1–100, default: 14) */
  fontSize?: number;
  /** Font weight (100–900, default: 400) */
  fontWeight?: number;
  /** Hexadecimal color code for widget text (default: #2D2D2D) */
  textColor?: string;
  /** Whether to show border on the widget (default: true) */
  showBorder?: boolean;
  /** Hexadecimal color code for widget border (default: #E0E0E0) */
  borderColor?: string;
  /** Border radius in pixels (1–25, default: 8) */
  borderRadius?: number;
  /** Border width in pixels (1–4, default: 1) */
  borderWidth?: number;
  /** Hexadecimal color code for widget background (default: #FFFFFF) */
  backgroundColor?: string;
  /** How the info button is displayed */
  infoButtonLayout?: 'icon' | 'link';
  /** Hexadecimal color code for the info icon (default: #9E9E9E) */
  infoIconColor?: string;
  /** Hexadecimal color code for the info link (default: #F21C58) */
  infoLinkColor?: string;
  /** Label shown on the info link text (default: "Learn more") */
  infoLinkText?: string;
}

/**
 * Machine-readable error codes for widget error events.
 */
export type MessagingErrorCode =
  | 'MISSING_REQUIRED_ATTRIBUTE'
  | 'INVALID_ATTRIBUTE_VALUE'
  | 'API_REQUEST_FAILED'
  | 'API_RESPONSE_INVALID'
  | 'RENDER_FAILED'
  | 'TIMEOUT';

/** Maps WidgetStyles keys to CSS variable suffixes */
export const WIDGET_STYLES_CSS_MAP: Record<string, { suffix: string; unit?: string }> = {
  fontSize: { suffix: 'font-size', unit: 'px' },
  fontWeight: { suffix: 'font-weight' },
  fontFamily: { suffix: 'font-family' },
  textColor: { suffix: 'text-color' },
  backgroundColor: { suffix: 'background-color' },
  borderColor: { suffix: 'border-color' },
  borderRadius: { suffix: 'border-radius', unit: 'px' },
  borderWidth: { suffix: 'border-width', unit: 'px' },
  infoIconColor: { suffix: 'info-icon-color' },
  infoLinkColor: { suffix: 'info-link-color' },
};
