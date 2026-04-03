/**
 * Generic modal management utility
 */

import { INSTALLMENT_CONFIG_SCHEMA } from '../../../../config/installment-schema.js';
import { logger } from '@unzer/messaging-core';

export interface ModalConfig {
  title: string;
  styleConfig?: Record<string, unknown>;
  targetContainer?: HTMLElement;
}

export interface ModalContent {
  contentHTML: string;
  footerHTML?: string;
  onContentReady?: (modalWrapper: HTMLElement) => void;
}

export class ModalManager {
  private modalInstance: HTMLElement | null = null;
  private isModalOpen: boolean = false;

  constructor(private config: ModalConfig, private hostElement?: HTMLElement) {}

  /**
   * Propagate CSS variables from host component to modal wrapper
   */
  private propagateCSSVariables(modalWrapper: HTMLElement): void {
    if (!this.hostElement) {
      logger.info('ModalManager: No host element to propagate CSS variables from', 'ModalManager');
      return;
    }

    // Get computed styles from host element
    const hostStyles = getComputedStyle(this.hostElement);
    
    // Get variables from schema dynamically
    const variablesToPropagate = this.getCSSVariablesFromSchema();

    // Propagate each variable
    let propagatedCount = 0;
    variablesToPropagate.forEach(variable => {
      const value = hostStyles.getPropertyValue(variable).trim();
      if (value) {
        modalWrapper.style.setProperty(variable, value);
        logger.info(`ModalManager: Propagated ${variable}: ${value}`, 'ModalManager');
        propagatedCount++;
      }
    });

    logger.info(`ModalManager: ${propagatedCount}/${variablesToPropagate.length} CSS variables propagated to modal wrapper`, 'ModalManager');
  }

  /**
   * Extract CSS variables from installment widget schema
   */
  private getCSSVariablesFromSchema(): string[] {
    try {
      // Extract variables from imported schema
      const schemaVariables = this.extractCSSVariablesFromSchema(INSTALLMENT_CONFIG_SCHEMA);
      logger.info(`ModalManager: Extracted ${schemaVariables.length} CSS variables from schema`, 'ModalManager');
      return schemaVariables;
    } catch (error) {
      logger.warn('ModalManager: Could not extract from schema, using fallback variables', 'ModalManager', error);
      return this.getFallbackCSSVariables();
    }
  }

  /**
   * Extract CSS variables from schema structure
   */
  private extractCSSVariablesFromSchema(schema: { tabs?: Array<{ sections?: Array<{ fields?: Array<{ metadata?: { cssVariable?: string } }> }> }> }): string[] {
    const variables: string[] = [];
    
    // Traverse schema tabs and sections
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

  /**
   * Fallback CSS variables when schema is not available
   */
  private getFallbackCSSVariables(): string[] {
    return [
      // Installment-specific variables (from schema)
      '--unzer-installments-background-color',
      '--unzer-installments-text-color',
      '--unzer-installments-border-color',
      '--unzer-installments-border-radius',
      '--unzer-installments-border-width',
      '--unzer-installments-font-size',
      '--unzer-installments-font-weight',
      '--unzer-installments-font-family',
      '--unzer-installments-spacing',
      '--unzer-installments-shadow',
      // Base variables for backwards compatibility
      '--unzer-font-size',
      '--unzer-font-weight',
      '--unzer-font-family',
      '--unzer-color-text-primary',
      '--unzer-text-color',
      '--unzer-background-color',
      '--unzer-border-color',
      '--unzer-border-radius',
      '--unzer-border-width',
      '--unzer-spacing',
      '--unzer-shadow'
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


  /**
   * Open modal with generic content
   */
  openModal(
    content: ModalContent,
    onModalClose: () => void,
    targetContainer?: HTMLElement
  ): void {
    this.isModalOpen = true;
    this.createPortaledModal(content, onModalClose, targetContainer);
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this.isModalOpen = false;
    this.cleanupModal();
  }

  /**
   * Create modal as portal with auto-detection for preview mode
   */
  private createPortaledModal(
    content: ModalContent,
    onModalClose: () => void,
    explicitTargetContainer?: HTMLElement
  ): void {
    // Cleanup existing modal first
    this.cleanupModal();

    // Determine target container with auto-detection for preview mode
    let targetContainer: HTMLElement;
    
    if (explicitTargetContainer) {
      // Explicit container has highest priority
      logger.info('ModalManager: Using explicit target container:', 'ModalManager', { tagName: explicitTargetContainer.tagName, className: explicitTargetContainer.className });
      targetContainer = explicitTargetContainer;
    } else if (this.config.targetContainer) {
      // Config container is second priority
      logger.info('ModalManager: Using config target container:', 'ModalManager', { tagName: this.config.targetContainer.tagName, className: this.config.targetContainer.className });
      targetContainer = this.config.targetContainer;
    } else {
      // Auto-detect based on preview mode
      const deviceContainer = this.findDeviceContainer();
      targetContainer = deviceContainer || document.body;
      logger.info('ModalManager: Using target container:', 'ModalManager', { tagName: targetContainer.tagName, className: targetContainer.className || 'document.body' });
    }
    
    const useAbsolute = targetContainer !== document.body;
    logger.info('ModalManager: Modal positioning:', 'ModalManager', { positioning: useAbsolute ? 'absolute' : 'fixed' });

    // Create modal wrapper
    const modalWrapper = document.createElement('div');
    modalWrapper.setAttribute('data-unzer-modal-portal', 'true');
    modalWrapper.style.cssText = `
      position: ${useAbsolute ? 'absolute' : 'fixed'};
      inset: 0;
      z-index: 2147483647;
      pointer-events: ${this.isModalOpen ? 'auto' : 'none'};
      container-type: inline-size;
    `;

    // Propagate CSS variables from host component to modal wrapper
    requestAnimationFrame(() => this.propagateCSSVariables(modalWrapper));

    modalWrapper.innerHTML = `
      <unzer-modal
        ${this.isModalOpen ? 'open' : ''}
        title="">
        ${content.contentHTML}
      </unzer-modal>
    `;

    // Add event listeners
    const modal = modalWrapper.querySelector('unzer-modal') as HTMLElement & { showClose: boolean } | null;

    if (modal) {
      modal.showClose = false;
      modal.addEventListener('modal-close', () => {
        onModalClose();
        this.closeModal();
      });
    }

    // Listen for close-request from details component
    modalWrapper.addEventListener('close-request', () => {
      onModalClose();
      this.closeModal();
    });

    // Allow consumer to set up content-specific logic
    if (content.onContentReady) {
      content.onContentReady(modalWrapper);
    }

    // Add to target container
    targetContainer.appendChild(modalWrapper);
    this.modalInstance = modalWrapper;
  }

  /**
   * Cleanup portaled modal
   */
  private cleanupModal(): void {
    if (this.modalInstance && this.modalInstance.parentNode) {
      this.modalInstance.parentNode.removeChild(this.modalInstance);
      this.modalInstance = null;
    }
  }

  /**
   * Cleanup on component disconnect
   */
  destroy(): void {
    this.cleanupModal();
    this.isModalOpen = false;
  }
}
