/**
 * Invoice Modal Management
 */
import { INVOICE_CONFIG_SCHEMA } from '../../../../config/invoice-schema.js';
import { logger } from '@unzer/messaging-core';

export interface ModalConfig {
  title: string;
  styleConfig?: Record<string, unknown>;
  targetContainer?: HTMLElement;
}

export interface ModalContent {
  contentHTML: string;
  onContentReady?: (modalWrapper: HTMLElement) => void;
}

export class ModalManager {
  private modalInstance: HTMLElement | null = null;
  private isModalOpen: boolean = false;

  constructor(private config: ModalConfig, private hostElement?: HTMLElement) {}

  private propagateCSSVariables(modalWrapper: HTMLElement): void {
    if (!this.hostElement) return;

    const hostStyles = getComputedStyle(this.hostElement);
    const variablesToPropagate = this.getCSSVariablesFromSchema();

    variablesToPropagate.forEach(variable => {
      const value = hostStyles.getPropertyValue(variable).trim();
      if (value) {
        modalWrapper.style.setProperty(variable, value);
      }
    });
  }

  private getCSSVariablesFromSchema(): string[] {
    try {
      return this.extractCSSVariablesFromSchema(INVOICE_CONFIG_SCHEMA);
    } catch (error) {
      logger.warn('ModalManager: Could not extract from schema, using fallback', 'InvoiceModalManager', error);
      return this.getFallbackCSSVariables();
    }
  }

  private extractCSSVariablesFromSchema(schema: { tabs?: Array<{ sections?: Array<{ fields?: Array<{ metadata?: { cssVariable?: string } }> }> }> }): string[] {
    const variables: string[] = [];
    schema.tabs?.forEach((tab) => {
      tab.sections?.forEach((section) => {
        section.fields?.forEach((field) => {
          if (field.metadata?.cssVariable) {
            variables.push(field.metadata.cssVariable);
          }
        });
      });
    });
    return [...new Set(variables)];
  }

  private getFallbackCSSVariables(): string[] {
    return [
      // Invoice-specific variables
      '--unzer-invoice-primary-color',
      '--unzer-invoice-secondary-color',
      '--unzer-invoice-background-color',
      '--unzer-invoice-text-color',
      '--unzer-invoice-border-color',
      '--unzer-invoice-border-radius',
      '--unzer-invoice-border-width',
      '--unzer-invoice-font-size',
      '--unzer-invoice-font-weight',
      '--unzer-invoice-font-family',
      '--unzer-invoice-spacing',
      '--unzer-invoice-shadow',
      // Base variables for backwards compatibility
      '--unzer-font-size',
      '--unzer-font-weight',
      '--unzer-font-family',
      '--unzer-color-text-primary',
      '--unzer-text-color',
      '--unzer-primary-color',
      '--unzer-secondary-color',
      '--unzer-background-color',
      '--unzer-border-color',
      '--unzer-border-radius',
      '--unzer-border-width',
      '--unzer-spacing',
      '--unzer-shadow',
    ];
  }

  /**
   * Detect if we're in preview mode.
   * Any preview host (e.g. styler) sets data-unzer-preview on a container ancestor.
   */
  private isInPreviewMode(): boolean {
    if (!this.hostElement) return false;
    return this.hostElement.closest('[data-unzer-preview]') !== null;
  }

  /**
   * Check if device is in mobile preview mode.
   * Preview host sets data-unzer-preview="mobile" for mobile device emulation.
   */
  private isDeviceInMobileMode(): boolean {
    if (!this.hostElement) return false;
    const previewHost = this.hostElement.closest('[data-unzer-preview]');
    return previewHost?.getAttribute('data-unzer-preview') === 'mobile';
  }

  /**
   * Find device container in preview mode (only for mobile devices).
   * Returns the preview host element when in mobile preview mode.
   */
  private findDeviceContainer(): HTMLElement | null {
    if (!this.hostElement) return null;
    const previewHost = this.hostElement.closest('[data-unzer-preview]') as HTMLElement | null;
    if (!previewHost || previewHost.getAttribute('data-unzer-preview') !== 'mobile') return null;
    return previewHost;
  }

  openModal(content: ModalContent, onModalClose: () => void, targetContainer?: HTMLElement): void {
    this.isModalOpen = true;
    this.createPortaledModal(content, onModalClose, targetContainer);
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.cleanupModal();
  }

  private createPortaledModal(
    content: ModalContent,
    onModalClose: () => void,
    explicitTargetContainer?: HTMLElement
  ): void {
    this.cleanupModal();

    let targetContainer: HTMLElement;

    if (explicitTargetContainer) {
      targetContainer = explicitTargetContainer;
    } else if (this.config.targetContainer) {
      targetContainer = this.config.targetContainer;
    } else {
      const deviceContainer = this.findDeviceContainer();
      targetContainer = deviceContainer || document.body;
    }

    const useAbsolute = targetContainer !== document.body;

    const modalWrapper = document.createElement('div');
    modalWrapper.setAttribute('data-unzer-modal-portal', 'true');
    modalWrapper.style.cssText = `
      position: ${useAbsolute ? 'absolute' : 'fixed'};
      inset: 0;
      z-index: 2147483647;
      pointer-events: ${this.isModalOpen ? 'auto' : 'none'};
      container-type: inline-size;
    `;

    requestAnimationFrame(() => this.propagateCSSVariables(modalWrapper));

    modalWrapper.innerHTML = `
      <unzer-modal
        ${this.isModalOpen ? 'open' : ''}
        title="">
        ${content.contentHTML}
      </unzer-modal>
    `;

    const modal = modalWrapper.querySelector('unzer-modal') as HTMLElement & { showClose: boolean } | null;
    if (modal) {
      modal.showClose = false;
      modal.addEventListener('modal-close', () => {
        onModalClose();
        this.closeModal();
      });
    }

    modalWrapper.addEventListener('close-request', () => {
      onModalClose();
      this.closeModal();
    });

    if (content.onContentReady) {
      content.onContentReady(modalWrapper);
    }

    targetContainer.appendChild(modalWrapper);
    this.modalInstance = modalWrapper;
  }

  private cleanupModal(): void {
    if (this.modalInstance && this.modalInstance.parentNode) {
      this.modalInstance.parentNode.removeChild(this.modalInstance);
      this.modalInstance = null;
    }
  }

  destroy(): void {
    this.cleanupModal();
    this.isModalOpen = false;
  }
}
