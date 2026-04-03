import { css, CSSResult, unsafeCSS } from 'lit';

/**
 * Convert CSS text to Lit CSSResult
 */
export function cssText(cssContent: string): CSSResult {
  return css`
    ${unsafeCSS(cssContent)}
  `;
}

