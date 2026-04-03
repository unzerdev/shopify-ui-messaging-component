/**
 * Checkbox Field Renderer
 * Renders checkbox and toggle fields from schema
 */

import { html, TemplateResult } from 'lit';
import { FieldSchema, IFieldRenderer, TranslateFn } from '../types/schema-types.js';
import type { FieldValue } from '../../types/common-types.js';
import '../../../infrastructure/ui/components/shared/input/checkbox/unzer-checkbox-input.js';
import { logger } from '../../../infrastructure/logging/logger.js';

export class CheckboxFieldRenderer implements IFieldRenderer {
  canRender(field: FieldSchema): boolean {
    return field.type === 'checkbox' || field.type === 'toggle';
  }

  render(
    field: FieldSchema,
    value: FieldValue,
    onChange: (value: FieldValue) => void,
    disabled = false,
    _t?: TranslateFn
  ): TemplateResult {
    const isToggle = field.type === 'toggle';
    
    return html`
      <unzer-checkbox-input
        id="${field.key}"
        type="checkbox"
        ?checked=${value || false}
        ?disabled=${disabled}
        variant="${isToggle ? 'toggle' : 'default'}"
        @unzer-change=${(e: CustomEvent) => {
          logger.info('Toggle/Checkbox change:', 'CheckboxFieldRenderer', {
            field: field.key, 
            type: field.type,
            detail: e.detail,
            checked: e.detail.checked,
            value: e.detail.value
          });
          onChange(e.detail.checked);
        }}
      >
      </unzer-checkbox-input>
    `;
  }
}