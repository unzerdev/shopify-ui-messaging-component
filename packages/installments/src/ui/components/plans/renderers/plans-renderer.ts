import { html } from 'lit';
import { formatAmount } from '../utils/plans-utils.js';
import { GetInstallmentPlansResponse } from '../../../../application/dto';
import { isNavigationLayout } from '../../../../types/installment-types.js';
import type { InstallmentError, InstallmentErrorCode } from '../../../../types/installment-error-types.js';

/** Maps error codes to translation key prefixes */
const ERROR_KEY_MAP: Record<InstallmentErrorCode, string> = {
  AUTH_ERROR: 'installments.error.auth',
  NETWORK_ERROR: 'installments.error.network',
  SERVER_ERROR: 'installments.error.server',
  VALIDATION_ERROR: 'installments.error.validation',
  NO_PLANS: 'installments.error.noPlans',
  AMOUNT_ERROR: 'installments.error.amount',
  RATE_LIMIT_ERROR: 'installments.error.rateLimit',
  UNKNOWN_ERROR: 'installments.error.unknown',
};

/**
 * Handles rendering of the installment plans component
 */
export class PlansRenderer {
  /**
   * Render error state with translated, context-specific messages
   */
  renderErrorState(error: InstallmentError, t: (key: string) => string) {
    const keyPrefix = ERROR_KEY_MAP[error.code] || ERROR_KEY_MAP.UNKNOWN_ERROR;
    const title = t(`${keyPrefix}Title`);
    const description = t(`${keyPrefix}Description`);

    return html`
      <div class="error-state">
        <div class="error-badge">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
        </div>
        <div class="error-body">
          <span class="error-title">${title}</span>
          <span class="error-separator">-</span>
          <span class="error-desc">${description}</span>
        </div>
      </div>
    `;
  }

  /**
   * Render main plans content
   */
  renderPlansContent(
    config: Record<string, unknown>,
    response: GetInstallmentPlansResponse,
    onPlanSelect: (index: number) => void,
    onDetailsToggle: () => void,
    currentPlanIndex: number = 0,
    isLoading: boolean = false
  ) {
    return html`
      <div class="plans-container ${isLoading ? 'is-loading' : ''}">
        <div class="navigation-area">
          ${isNavigationLayout(config.installmentLayout as string)
            ? html`
                <unzer-navigation
                  locale="${config.locale || 'en'}"
                  .plans="${response.plans || []}"
                  .currentIndex="${currentPlanIndex}"
                  .amount="${response.requestAmount}"
                  .currency="${response.requestCurrency || config.currency}"
                  .installmentLayout="${config.installmentLayout}"
                  .unzerLogoDisplay="${config.unzerLogoDisplay ?? 'unzer-logo'}"
                  .unzerLogoPosition="${config.unzerLogoPosition || 'right'}"
                  .showInfo="${true}"
                  .infoButtonLayout="${config.infoButtonLayout ?? 'icon'}"
                  .infoLinkText="${config.infoLinkText ?? ''}"
                  .styleConfig="${config.styleConfig}"
                  @plan-navigate="${(e: CustomEvent) => onPlanSelect(e.detail.index)}"
                  @details-toggle="${onDetailsToggle}"
                >
                </unzer-navigation>
              `
            : this.renderAmountLabel(response, config)}
        </div>
      </div>
    `;
  }

  /**
   * Render amount label when navigation is not shown
   */
  private renderAmountLabel(response: GetInstallmentPlansResponse, config: Record<string, unknown>) {
    const amount = response.requestAmount || config.amount || 0;
    const currency = response.requestCurrency || config.currency;
    const formattedAmount = formatAmount(
      typeof amount === 'string' ? parseFloat(amount) : (amount as number),
      currency as string
    );

    return html`<span class="amount-label">${formattedAmount}</span>`;
  }

}
