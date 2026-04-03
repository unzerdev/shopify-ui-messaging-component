import { html, CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UnzerIncludeErrorEvent } from './events/include-error.js';
import { UnzerLoadEvent } from './events/load.js';
import { UnzerElement } from '../../../base/unzer-element.js';
import { cssText } from '../../../utils/css-utils.js';
import { sanitizeHTML, sanitizeHTMLWithScripts } from '../../../../security/sanitize.js';
import includeStylesContent from './styles/include.css?inline';

/**
 * @summary Includes give you the power to embed external HTML files into the page.
 * @documentation Unzer Include Component
 * @status stable
 * @since 1.0
 *
 * @event unzer-load - Emitted when the included file is loaded.
 * @event unzer-include-error - Emitted when the included file fails to load due to an error.
 */
@customElement('unzer-include')
export class UnzerInclude extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      super.styles,
      cssText(includeStylesContent)
    ];
  }

  /**
   * The location of the HTML file to include. Be sure you trust the content you are including as it will be executed as
   * code and can result in XSS attacks.
   */
  @property() src: string = '';

  /** The fetch mode to use. */
  @property() mode: 'cors' | 'no-cors' | 'same-origin' = 'cors';

  /**
   * Allows included scripts to be executed. Be sure you trust the content you are including as it will be executed as
   * code and can result in XSS attacks.
   */
  @property({ attribute: 'allow-scripts', type: Boolean }) allowScripts = false;

  private loadedSrcs = new Set<string>();

  connectedCallback() {
    super.connectedCallback();
    if (this.src && !this.loadedSrcs.has(this.src)) {
      this.loadContent();
    }
  }

  private async loadContent() {
    if (!this.src || this.loadedSrcs.has(this.src)) return;

    this.loadedSrcs.add(this.src);

    try {
      const response = await fetch(this.src, { mode: this.mode });

      if (!response.ok) {
        this.dispatchEvent(new UnzerIncludeErrorEvent({ status: response.status }));
        return;
      }

      const rawHtml = await response.text();
      this.innerHTML = this.allowScripts
        ? sanitizeHTMLWithScripts(rawHtml)
        : sanitizeHTML(rawHtml);

      if (this.allowScripts) {
        [...this.querySelectorAll('script')].forEach(script => {
          const newScript = document.createElement('script');
          [...script.attributes].forEach(attr => newScript.setAttribute(attr.name, attr.value));
          newScript.textContent = script.textContent;
          script.parentNode!.replaceChild(newScript, script);
        });
      }

      this.dispatchEvent(new UnzerLoadEvent());
    } catch (error) {
      this.dispatchEvent(new UnzerIncludeErrorEvent({ status: -1 }));
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-include': UnzerInclude;
  }
}
