import DOMPurify, { type Config } from 'dompurify';

const DEFAULT_CONFIG: Config = {
  USE_PROFILES: { html: true, svg: true },
  ALLOW_DATA_ATTR: true,
  ALLOW_ARIA_ATTR: true,
  CUSTOM_ELEMENT_HANDLING: {
    tagNameCheck: /^unzer-/,
    attributeNameCheck: /.*/,
    allowCustomizedBuiltInElements: false,
  },
};

const SCRIPTS_CONFIG: Config = {
  ...DEFAULT_CONFIG,
  ADD_TAGS: ['script'],
  FORCE_BODY: true,
};

/**
 * Sanitizes HTML content, stripping all scripts, event handlers, and dangerous elements.
 * Allows standard HTML, SVG, data attributes, and `<unzer-*>` custom elements.
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, DEFAULT_CONFIG);
}

/**
 * Sanitizes HTML content while preserving `<script>` tags.
 * Inline event handlers (`onerror`, `onclick`, etc.) and `javascript:` URIs are still stripped.
 *
 * @security Only use this when you fully trust the content source.
 * Even with sanitization, allowing scripts carries inherent XSS risk.
 */
export function sanitizeHTMLWithScripts(dirty: string): string {
  return DOMPurify.sanitize(dirty, SCRIPTS_CONFIG);
}
