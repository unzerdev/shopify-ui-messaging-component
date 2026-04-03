/**
 * Color Field Renderer
 * Renders color input fields from schema
 */

import { html, TemplateResult } from 'lit';
import { FieldSchema, IFieldRenderer, TranslateFn } from '../types/schema-types.js';
import type { FieldValue } from '../../types/common-types.js';
import '../../../infrastructure/ui/components/shared/input/color/unzer-color-input.js';

export class ColorFieldRenderer implements IFieldRenderer {
  canRender(field: FieldSchema): boolean {
    return field.type === 'color';
  }

  render(
    field: FieldSchema,
    value: FieldValue,
    onChange: (value: FieldValue) => void,
    disabled = false,
    _t?: TranslateFn
  ): TemplateResult {
    return html`
      <unzer-color-input
        id="${field.key}"
        .value=${value || '#000000'}
        ?disabled=${disabled}
        @unzer-input=${(e: CustomEvent) => onChange(e.detail.value)}
      ></unzer-color-input>
    `;
  }
}