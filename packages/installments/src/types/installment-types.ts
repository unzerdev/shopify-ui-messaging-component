/**
 * Installment Widget Specific Types
 * Contains all type definitions specific to installment functionality
 */

// Customer types for installment calculation
export const CUSTOMER_TYPES = ['B2C', 'B2B'] as const;
export type CustomerType = typeof CUSTOMER_TYPES[number];

// Supported currencies for installment API
export const CURRENCIES = ['EUR', 'CHF'] as const;
export type Currency = typeof CURRENCIES[number];

// Supported countries for installment API
export const COUNTRIES = ['DE', 'AT', 'CH'] as const;
export type Country = typeof COUNTRIES[number];

// Layout options for installment display
export const LAYOUT_OPTIONS = ['buttons', 'arrows', 'select', 'text', ''] as const;
export type LayoutOption = typeof LAYOUT_OPTIONS[number];

// Valid navigation layouts (excludes empty string)
export const VALID_NAVIGATION_LAYOUTS = ['buttons', 'arrows', 'select', 'text'] as const;
export type ValidNavigationLayout = typeof VALID_NAVIGATION_LAYOUTS[number];

// Helper function to check if layout enables navigation
export const isNavigationLayout = (layout: string | undefined | null): layout is ValidNavigationLayout => {
  return layout ? VALID_NAVIGATION_LAYOUTS.includes(layout as ValidNavigationLayout) : false;
};

// Valid details display elements (for array usage)
export const VALID_DETAILS_ELEMENTS = ['modal', 'logo', 'timeline'] as const;
export type ValidDetailsElement = typeof VALID_DETAILS_ELEMENTS[number];

// Logo variant options
export const LOGO_VARIANT_OPTIONS = ['unzer-logo', 'icon', 'pm-logo', ''] as const;
export type LogoVariantOption = typeof LOGO_VARIANT_OPTIONS[number];

// Logo position options
export const LOGO_POSITION_OPTIONS = ['left', 'right'] as const;
export type LogoPositionOption = typeof LOGO_POSITION_OPTIONS[number];

// Info button layout options
export const INFO_BUTTON_LAYOUT_OPTIONS = ['icon', 'link'] as const;
export type InfoButtonLayoutOption = typeof INFO_BUTTON_LAYOUT_OPTIONS[number];

/**
 * Unzer Installments payment method configuration.
 * Passed via payment-method-config attribute.
 */
export interface UnzerInstallmentsConfig {
  /** Public key of the corresponding merchant account on Unzer (required) */
  publicKey: string;
  /** Layout of the installments widget (default: "buttons") */
  installmentLayout?: 'buttons' | 'arrows' | 'select';
  /** Hex color for installment buttons in default state (default: #E0E0E0) */
  defaultInstallmentButtonColor?: string;
  /** Hex color for the selected installment button (default: #F21C58) */
  selectedInstallmentButtonColor?: string;
  /** Hex color for navigational arrows (default: #F21C58) */
  installmentsNavigationalArrowsColor?: string;
  /** Whether to show timeline in the informational pop-up (default: true) */
  showTimeline?: boolean;
}

// Installment-specific configuration
export interface InstallmentSpecificConfig {
  publicKey?: string;
  amount: number;
  currency: Currency;
  country: Country;
  customerType: CustomerType;
  installmentLayout: LayoutOption;
  unzerLogoDisplay: LogoVariantOption;
  unzerLogoPosition: LogoPositionOption;
  showTimeline: boolean;
  infoButtonLayout: InfoButtonLayoutOption;
}