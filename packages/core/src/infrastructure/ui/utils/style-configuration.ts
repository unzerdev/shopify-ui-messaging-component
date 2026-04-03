/**
 * Standardized Style Configuration Utility
 * Centralized style handling to avoid duplication across components
 */

export interface StandardStyleConfig {
  [key: string]: string | number | boolean | undefined;
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontFamily?: string;
  spacing?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  shadow?: boolean;
}

/**
 * Convert fontWeight to number
 */
export function normalizeFontWeight(fontWeight?: string | number): number | undefined {
  if (typeof fontWeight === 'number') return fontWeight;
  if (typeof fontWeight === 'string') {
    const parsed = parseInt(fontWeight, 10);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

/**
 * Convert number or string to CSS string value
 */
export function toCSSValue(value?: string | number | boolean): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

/**
 * Convert style configuration to CSS custom properties
 * @param styleConfig - The style configuration object
 * @returns Record of CSS custom property names and values
 */
export function convertStyleConfigToCSSVariables(
  styleConfig?: StandardStyleConfig
): Record<string, string> {
  const cssVariables: Record<string, string> = {};
  
  // Always set default values, even if no styleConfig provided
  const config = styleConfig || {};

  // Color mappings
  if (config.primaryColor) {
    cssVariables['--unzer-color-primary'] = config.primaryColor;
  }

  if (config.secondaryColor) {
    cssVariables['--unzer-color-secondary'] = config.secondaryColor;
  }

  if (config.textColor) {
    cssVariables['--unzer-color-text-primary'] = config.textColor;
    cssVariables['--unzer-color-primary'] = config.textColor; // Override amount label color
    cssVariables['color'] = config.textColor;
  }

  // Typography mappings
  if (config.fontSize) {
    cssVariables['--unzer-font-size'] = `${config.fontSize}px`;
    cssVariables['--unzer-font-size-md'] = `${config.fontSize}px`;
    cssVariables['--unzer-font-size-lg'] = `${config.fontSize}px`;
  }

  if (config.fontWeight) {
    cssVariables['--unzer-font-weight'] = config.fontWeight.toString();
    cssVariables['--unzer-font-weight-medium'] = config.fontWeight.toString();
    cssVariables['--unzer-font-weight-bold'] = config.fontWeight.toString();
  }

  if (config.fontFamily) {
    cssVariables['--unzer-font-family'] = config.fontFamily;
    cssVariables['font-family'] = config.fontFamily;
  }

  // Spacing and layout
  if (config.spacing) {
    cssVariables['--unzer-spacing-md'] = `${config.spacing}px`;
  }

  // Always set border-radius, use default if not provided
  const borderRadius = config.borderRadius || 8; // Default 8px border-radius
  cssVariables['--unzer-border-radius'] = `${borderRadius}px`;
  cssVariables['--unzer-border-radius-md'] = `${borderRadius}px`;
  cssVariables['--unzer-border-radius-sm'] = `${Math.max(borderRadius - 2, 1)}px`;

  // Border width and color - always set defaults
  const borderWidth = config.borderWidth !== undefined ? config.borderWidth : 1;
  cssVariables['--unzer-border-width'] = `${borderWidth}px`;

  // Border color - always set default
  const borderColor = config.borderColor || '#dee2e6';
  cssVariables['--unzer-border-color'] = borderColor;

  // Shadow handling is now done via CSS variables

  return cssVariables;
}

/**
 * Convert style configuration to component-specific CSS configuration
 */
export function convertStyleConfigToComponentConfig(styleConfig?: StandardStyleConfig): Record<string, string> {
  if (!styleConfig) return {};

  return {
    // Button-specific mappings
    planButtonBackgroundColor: styleConfig.primaryColor || '#f3f4f6',
    planButtonSelectedBackgroundColor: styleConfig.secondaryColor || '#2563eb',
    planButtonSelectedBorderColor: styleConfig.secondaryColor || '#2563eb',
    planButtonHoverBackgroundColor: styleConfig.primaryColor
      ? `${styleConfig.primaryColor}20`
      : '#dbeafe',
    planButtonHoverBorderColor: styleConfig.primaryColor || '#3b82f6',
    planButtonColor: styleConfig.textColor || '#374151',
    planButtonSelectedColor: styleConfig.textColor || '#ffffff',
    planButtonHoverColor: styleConfig.textColor || '#000',

    // Amount label
    amountLabelColor: styleConfig.textColor || '#1976d2',
    amountLabelFontSize: styleConfig.fontSize ? `${styleConfig.fontSize}px` : '18px',
    amountLabelFontWeight: styleConfig.fontWeight ? String(styleConfig.fontWeight) : '600',
    amountLabelFontFamily: styleConfig.fontFamily || 'system-ui, -apple-system, sans-serif',

    // Container styles
    planButtonsBackgroundColor: '#ffffff',
    planButtonsBorderColor: '#e2e8f0',
    planButtonsBorderRadius: `${styleConfig.borderRadius || 12}px`,
    planButtonsPadding: `${styleConfig.spacing || 16}px`,
    planButtonsBoxShadow: styleConfig.shadow ? 'var(--shadow-md)' : 'none',

    // Border radius for buttons specifically
    planButtonRadius: `${styleConfig.borderRadius || 8}px`,

    // Border width and color
    planButtonBorderWidth: `${styleConfig.borderWidth || 1}px`,
    planButtonBorderColor: styleConfig.borderColor || '#e5e7eb',
  };
}
