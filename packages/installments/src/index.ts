/**
 * @unzer/messaging-installments
 * Installments Messaging Widget
 */
import { bootstrapCore } from '@unzer/messaging-core';
import { registerInstallmentsDependencies } from './infrastructure/di/installments-di.js';

// Bootstrap core (idempotent) and register installments widget
bootstrapCore();
registerInstallmentsDependencies();

// Export all installments UI components
export { UnzerInstallmentsWidget, UnzerInstallmentPlans } from './ui/components/plans/unzer-installment-plans.js';
export { UnzerInstallmentPlan } from './ui/components/plan/unzer-installment-plan.js';
export { UnzerPlanDetail } from './ui/components/plan/unzer-plan-detail.js';
export { UnzerInstallmentRate } from './ui/components/rate/unzer-installment-rate.js';
export { UnzerInstallmentPlansArrows } from './ui/components/navigation/unzer-installment-plans-arrows.js';
export { UnzerInstallmentPlansSelect } from './ui/components/navigation/unzer-installment-plans-select.js';
export { UnzerInstallmentPlansButtons } from './ui/components/navigation/unzer-installment-plans-buttons.js';
export { UnzerInstallmentInfoButton } from './ui/components/info/unzer-installment-info-button.js';
export { BaseNavigation } from './ui/components/navigation/base-navigation.js';
export { UnzerLogo } from './ui/components/unzer-logo/unzer-logo.js';

// Export widget class and controllers
export { InstallmentWidget } from './InstallmentWidget.js';

// Export installment-specific types and configs
export type {
  CustomerType,
  Currency,
  Country,
  LayoutOption,
  InstallmentSpecificConfig
} from './types/installment-types.js';
export {
  CUSTOMER_TYPES,
  CURRENCIES,
  COUNTRIES,
  LAYOUT_OPTIONS
} from './types/installment-types.js';
export { INSTALLMENT_DEFAULTS } from './config/installment-defaults.js';
export type { InstallmentError, InstallmentErrorCode } from './types/installment-error-types.js';
export { INSTALLMENT_ERROR_CODES } from './types/installment-error-types.js';

// Register top-level widget — child components are imported transitively
import './ui/components/plans/unzer-installment-plans.js';
