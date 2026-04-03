/**
 * Drag Option Field Renderer
 * Renders draggable option fields from schema
 */

import { html, TemplateResult, nothing, svg } from 'lit';
import { FieldSchema, IFieldRenderer, TranslateFn } from '../types/schema-types.js';
import type { FieldValue } from '../../types/common-types.js';
import '../../../infrastructure/ui/components/shared/drag/unzer-drag-option.js';
import { logger } from '../../../infrastructure/logging/logger.js';

export class DragOptionRenderer implements IFieldRenderer {
  canRender(field: FieldSchema): boolean {
    return field.type === 'drag-option';
  }

  render(
    field: FieldSchema,
    value: FieldValue,
    onChange: (value: FieldValue) => void,
    disabled = false,
    t?: TranslateFn
  ): TemplateResult {
    const options = field.options || [];
    
    // Check if multiple selections are allowed
    const allowMultiple = field.metadata?.multiple === true;
    
    // Handle different value types
    let activeValues: (string | boolean)[];
    if (value instanceof Array) {
      activeValues = value;
    } else if (typeof value === 'boolean') {
      // For boolean fields, if true, mark the first option as active
      activeValues = value && options.length > 0 ? [options[0].value] : [];
    } else if (value !== undefined && value !== null) {
      activeValues = [value as string | boolean];
    } else {
      activeValues = [];
    }

    return html`
      <div class="drag-options-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; width: 100%;">
        ${options.map(option => {
          const isActive = activeValues.includes(option.value);
          return html`
            <unzer-drag-option
              variant="card"
              option="${option.value}"
              label="${t ? t(option.labelKey) : option.labelKey}"
              ?active=${isActive}
              ?disabled=${disabled}
              draggable="true"
              click-only-when-active
              style="min-height: 100px; padding: 16px;"
              @drag-option-click="${(e: CustomEvent) => this.handleOptionClick(e, option.value, isActive, activeValues, onChange, allowMultiple, field)}"
              @drag-option-start="${(e: CustomEvent) => this.handleDragStart(e, field)}"
              @drag-option-end="${() => this.handleDragEnd()}"
            >
              ${option.icon ? this.getIconSvg(option.icon) : nothing}
            </unzer-drag-option>
          `;
        })}
      </div>
    `;
  }

  private handleOptionClick(
    _event: CustomEvent, 
    optionValue: string | boolean, 
    isActive: boolean, 
    currentValues: (string | boolean)[], 
    onChange: (value: FieldValue) => void,
    allowMultiple: boolean,
    field: FieldSchema
  ) {
    // For boolean fields with single option, toggle the boolean value
    if (!allowMultiple && field.options?.length === 1) {
      // If the option value is boolean, toggle it directly
      if (typeof optionValue === 'boolean') {
        onChange(!isActive);
      } else {
        // String option in single field - toggle boolean based on active state
        onChange(!isActive);
      }
      return;
    }
    
    // click-only-when-active means only active items can be clicked (to remove them)
    if (isActive) {
      if (allowMultiple) {
        // Remove this specific value from the array
        const newValues = currentValues.filter(v => v !== optionValue);
        onChange(newValues);
      } else {
        // Single selection mode - remove/deactivate
        onChange('');
      }
    }
  }
  // takes care of the mutual exclusivity between inline and modal

  private handleDragStart(event: CustomEvent, field: FieldSchema) {
    // Stop propagation to prevent infinite recursion
    event.stopPropagation();
    
    // Extract the option from the event detail
    const option = event.detail?.option;
    
    logger.info('DragOptionRenderer.handleDragStart:', 'DragOptionRenderer', { 
      option, 
      fieldKey: field.key, 
      eventDetail: event.detail 
    });
    
    // Store fieldKey globally for drag operations (backup for when document events fail)
    (globalThis as typeof globalThis & { __dragFieldKey?: string }).__dragFieldKey = field.key;
    
    // Emit drag start event on document for parent components to handle
    document.dispatchEvent(new CustomEvent('drag-option-start', {
      detail: { 
        option, 
        source: 'schema-config',
        originalEvent: event,
        fieldKey: field.key 
      },
      bubbles: true,
      composed: true
    }));
  }

  private handleDragEnd() {
    // Emit drag end event
    document.dispatchEvent(new CustomEvent('drag-option-end', {
      detail: { source: 'schema-config' },
      bubbles: true,
      composed: true
    }));
  }




  private getIconSvg(iconName: string): TemplateResult {
    // Custom SVG icons matching the old design - made larger
    const buttons = svg`
      <div slot="icon" class="icon-group">
        <svg width="48" height="32" viewBox="0 0 48 32" fill="none" class="drag-icon">
          <rect x="4" y="10" width="12" height="12" rx="2" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.5"/>
          <rect x="18" y="10" width="12" height="12" rx="2" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1.5"/>
          <rect x="32" y="10" width="12" height="12" rx="2" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1.5"/>
        </svg>
      </div>
    `;
    
    const arrows = svg`
      <div slot="icon" class="icon-group">
        <svg width="48" height="32" viewBox="0 0 48 32" fill="none" class="drag-icon">
          <path d="M12 16L6 10V13H2V19H6V22L12 16Z" fill="#3b82f6"/>
          <path d="M36 16L42 22V19H46V13H42V10L36 16Z" fill="#3b82f6"/>
        </svg>
      </div>
    `;
    
    const select = svg`
      <div slot="icon" class="icon-group">
        <svg width="48" height="32" viewBox="0 0 48 32" fill="none" class="drag-icon">
          <rect x="8" y="10" width="32" height="12" rx="2" fill="#f3f4f6" stroke="#9ca3af" stroke-width="1.5"/>
          <path d="M34 14L30 10V18L34 14Z" fill="#6b7280"/>
        </svg>
      </div>
    `;
    
    const logo = svg`
      <div slot="icon" class="icon-group">
        <svg width="48" height="32" viewBox="0 0 48 32" fill="none" class="drag-icon">
          <circle cx="24" cy="16" r="10" fill="#10b981"/>
          <rect x="18" y="10" width="12" height="12" rx="2" fill="#ffffff"/>
          <text x="24" y="19" text-anchor="middle" fill="#10b981" font-size="10" font-weight="bold">U</text>
        </svg>
      </div>
    `;
    
    const inline = svg`
      <div slot="icon" class="icon-group">
        <svg width="48" height="32" viewBox="0 0 48 32" fill="none" class="drag-icon">
          <rect x="8" y="10" width="24" height="3" rx="1.5" fill="#8b5cf6"/>
          <rect x="8" y="15" width="18" height="3" rx="1.5" fill="#a78bfa"/>
          <rect x="8" y="20" width="12" height="3" rx="1.5" fill="#c4b5fd"/>
        </svg>
      </div>
    `;
    
    const modal = svg`
      <div slot="icon" class="icon-group">
        <svg width="48" height="32" viewBox="0 0 48 32" fill="none" class="drag-icon">
          <rect x="4" y="4" width="40" height="24" rx="3" fill="#000000" opacity="0.3"/>
          <rect x="10" y="8" width="28" height="16" rx="2" fill="#ffffff" stroke="#e5e7eb" stroke-width="1.5"/>
          <rect x="13" y="11" width="8" height="2" rx="1" fill="#6b7280"/>
          <rect x="13" y="14" width="6" height="2" rx="1" fill="#9ca3af"/>
        </svg>
      </div>
    `;
    
    const timeline = svg`
      <div slot="icon" class="icon-group">
        <svg width="48" height="32" viewBox="0 0 48 32" fill="none" class="drag-icon">
          <circle cx="12" cy="16" r="3" fill="#3b82f6"/>
          <circle cx="24" cy="16" r="3" fill="#3b82f6"/>
          <circle cx="36" cy="16" r="3" fill="#3b82f6"/>
          <rect x="12" y="15" width="12" height="2" fill="#94a3b8"/>
          <rect x="24" y="15" width="12" height="2" fill="#94a3b8"/>
        </svg>
      </div>
    `;
    
    const visibilityOff = svg`
      <div slot="icon" class="icon-group">
        <svg width="48" height="32" viewBox="0 0 48 32" fill="none" class="drag-icon">
          <circle cx="24" cy="16" r="8" fill="none" stroke="#6b7280" stroke-width="2"/>
          <line x1="16" y1="8" x2="32" y2="24" stroke="#6b7280" stroke-width="2"/>
        </svg>
      </div>
    `;

    const icons: Record<string, TemplateResult> = {
      'view-module': buttons,
      'chevron-left': arrows,
      'list': select,
      'palette': logo,
      'view-list': inline,
      'open-in-new': modal,
      'timeline': timeline,
      'visibility-off': visibilityOff
    };
    
    return icons[iconName] || html``;
  }
}