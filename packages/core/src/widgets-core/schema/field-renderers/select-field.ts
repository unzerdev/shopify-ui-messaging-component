/**
 * Select Field Renderer
 * Renders select/dropdown fields from schema
 */

import { html, TemplateResult } from 'lit';
import { FieldSchema, IFieldRenderer, TranslateFn } from '../types/schema-types.js';
import type { FieldValue } from '../../types/common-types.js';
import '../../../infrastructure/ui/components/shared/select/unzer-select.js';

export class SelectFieldRenderer implements IFieldRenderer {
  canRender(field: FieldSchema): boolean {
    return field.type === 'select';
  }

  render(
    field: FieldSchema,
    value: FieldValue,
    onChange: (value: FieldValue) => void,
    disabled = false,
    t?: TranslateFn
  ): TemplateResult {
    const options = field.options || [];

    // Convert schema options to SelectOption format
    const selectOptions = options.map(option => ({
      value: option.value,
      label: t ? t(option.labelKey) : option.labelKey,
      disabled: option.disabled
    }));

    return html`
      <unzer-select
        id="${field.key}"
        .value=${value || ''}
        .options=${selectOptions}
        ?disabled=${disabled}
        placeholder="${field.metadata?.placeholder || 'Select an option...'}"
        @unzer-change=${(e: CustomEvent) => onChange(e.detail.value)}
      >
      </unzer-select>
    `;
  }
}