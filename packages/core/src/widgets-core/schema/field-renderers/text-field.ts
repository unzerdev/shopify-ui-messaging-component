/**
 * Text Field Renderer
 * Renders text input fields from schema
 */

import { html, TemplateResult } from 'lit';
import { FieldSchema, IFieldRenderer, TranslateFn } from '../types/schema-types.js';
import type { FieldValue } from '../../types/common-types.js';
import '../../../infrastructure/ui/components/shared/input/text/unzer-text-input.js';

export class TextFieldRenderer implements IFieldRenderer {
  canRender(field: FieldSchema): boolean {
    return field.type === 'text';
  }

  render(
    field: FieldSchema,
    value: FieldValue,
    onChange: (value: FieldValue) => void,
    disabled = false,
    _t?: TranslateFn
  ): TemplateResult {
    return html`
      <unzer-text-input
        id="${field.key}"
        .value=${value || ''}
        ?disabled=${disabled}
        placeholder=${field.metadata?.placeholder || ''}
        @unzer-change=${(e: CustomEvent) => onChange(e.detail.value)}
      ></unzer-text-input>
    `;
  }
}