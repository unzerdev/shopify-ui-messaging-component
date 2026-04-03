/**
 * Range Field Renderer
 * Renders range/slider input fields from schema
 */

import { html, TemplateResult } from 'lit';
import { FieldSchema, IFieldRenderer, TranslateFn } from '../types/schema-types.js';
import type { FieldValue } from '../../types/common-types.js';
import '../../../infrastructure/ui/components/shared/input/range/unzer-range-input.js';
import '../../../infrastructure/ui/components/shared/input/text/unzer-text-input.js';

export class RangeFieldRenderer implements IFieldRenderer {
  canRender(field: FieldSchema): boolean {
    return field.type === 'range' || field.type === 'number';
  }

  render(
    field: FieldSchema,
    value: FieldValue,
    onChange: (value: FieldValue) => void,
    disabled = false,
    _t?: TranslateFn
  ): TemplateResult {
    const min = field.validation?.min ?? 0;
    const max = field.validation?.max ?? 100;
    const step = field.validation?.step ?? 1;

    if (field.type === 'number') {
      // Render as number input
      return html`
        <unzer-text-input
          id="${field.key}"
          type="number"
          .value=${String(value || 0)}
          ?disabled=${disabled}
          min="${min}"
          max="${max}"
          step="${step}"
          @unzer-input=${(e: CustomEvent) => onChange(Number(e.detail.value))}
        ></unzer-text-input>
      `;
    }

    // Render as range slider
    return html`
      <unzer-range-input
        id="${field.key}"
        .value=${value || min}
        ?disabled=${disabled}
        min="${min}"
        max="${max}"
        step="${step}"
        @unzer-input=${(e: CustomEvent) => onChange(e.detail.value)}
      ></unzer-range-input>
    `;
  }
}