import { html, css, CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UnzerElement } from '@unzer/messaging-core';

/**
 * @summary Unzer Logo component for Invoice widget
 *
 * @example
 * ```html
 * <unzer-invoice-logo variant="logo"></unzer-invoice-logo>
 * ```
 */
@customElement('unzer-invoice-logo')
export class UnzerInvoiceLogo extends UnzerElement {
  static get styles(): CSSResultGroup {
    return [
      super.styles,
      css`
        :host {
          display: inline-flex;
          align-items: center;
        }
        svg {
          display: block;
        }
      `
    ];
  }

  @property({ type: Number })
  width = 97;

  @property({ type: Number })
  height = 22;

  @property({ type: String })
  variant: 'logo' | 'icon' | 'pm-logo' = 'logo';

  private renderTextLogo() {
    return html`
      <svg
        part="logo"
        width="63"
        height="14"
        viewBox="0 0 63 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0_invoice_logo)">
          <path d="M26.4259 4.98816V13.7457H22.8276V6.42232C22.8276 4.61769 21.4902 3.64379 20.2323 3.64379C19.1425 3.64379 18.2909 4.16685 17.473 5.34042V13.7463H13.8748V7.28322C13.5115 7.40943 13.1383 7.51555 12.7712 7.5978C12.5787 11.3251 9.95515 13.9824 6.39125 13.9824C2.68793 13.9824 0 11.1129 0 7.15946V0.302655H3.59891V7.15946C3.59891 8.63947 4.33044 10.3681 6.39187 10.3681C8.28823 10.3681 9.05913 8.90512 9.16983 7.518C7.67488 6.88635 6.74951 5.36428 6.74951 3.34302C6.74951 1.24955 8.30385 0.0182091 9.80319 0.0182091C11.7215 0.0182091 12.7831 1.93712 12.7731 3.8441C12.7731 3.8441 13.3052 3.65259 13.8748 3.32795V0.302027H17.473V1.45551C18.7042 0.449587 19.8409 0 21.1526 0C22.6019 0 23.9381 0.509239 24.9141 1.43416C25.8895 2.35845 26.4259 3.62056 26.4259 4.98816ZM27.8609 3.48869H33.9533L27.5339 11.1493L27.5289 11.1549V13.7457H38.9358V10.5647H32.4802L38.9308 2.80176L38.9358 2.79611V0.302655H27.8609V3.48869ZM50.5948 1.88061C51.8015 3.11006 52.4392 4.85442 52.4392 6.92528V8.17229H42.7717C43.0212 9.83066 44.2085 10.8196 45.9517 10.8196C47.4003 10.8196 48.6533 10.2344 49.2211 9.29313L49.2304 9.27682L49.2473 9.28438L52.0684 10.5603L52.0584 10.5804C50.9311 12.7536 48.6871 14 45.9004 14C41.8989 14 39.2103 11.1976 39.2103 7.02639C39.2103 5.05974 39.9237 3.26642 41.2192 1.97605C42.4641 0.735917 44.1266 0.0527446 45.9011 0.0527446C47.7986 0.0533726 49.4212 0.685056 50.5948 1.88061ZM48.9354 5.34733C48.6396 3.95963 47.5073 3.13267 45.9011 3.13267C44.4355 3.13267 43.3088 3.95963 42.8824 5.34733H48.9354ZM61.4552 0.204072C60.9782 0.0533728 60.4355 0.0533722 60.4355 0.0533722C59.255 0.0533722 58.1164 0.511123 57.1404 1.37702V0.302655H53.5421V13.7463H57.1404V5.40824C57.8501 4.0557 58.9392 3.31099 60.2072 3.31099C60.2072 3.31099 60.7774 3.31602 61.1326 3.42088L61.4552 0.204072Z" fill="#F21C58"/>
        </g>
        <defs>
          <clipPath id="clip0_invoice_logo">
            <rect width="62.0398" height="14" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    `;
  }

  private renderIconLogo() {
    return html`
      <img
        part="logo"
        width="22"
        height="22"
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAADoUlEQVR4Xu2a60uUQRTG909YDakoIjDog0VEN6jo9i2okNrN7qlIRZFBZUVE2gUxsvpSGHSRsiIqCIpKypJIhDCxzIwMVLqXSYiVl33PnGYWV3fPWXfmXd1tV3zg92Xfec6ZB96ZdxbG4egROlOdkOjKtRJc5RKMZSDBVQM5l6f75t6rDmfqeEhY0UQNsY+7Sc29N0h8hvDhblJvk8NyutP5w/jCk+jKc3jftyAP44xyR5Af45LhILHGcJABMW4DwuIDCMvyEKZl8+dhYBxElNeGxErOZB4KTN2GoqwGUQgMUMNnhKxTbLwdjIPoZE3MYh5/YM5OxI8t1BYg2HeR+UyJTpApWxG/tlILV2c3Qlo+9xsQlSDi7nM6vH/Vf0Ar0c1q6Ih8kFGrEf900uEhBUsO8joaIh4EFuyhQ7WCwlusjo7IB0k9RIdqJW5Xsjo6YjNIZT3C6gKEhXtZvf6IfJC5u+hQvfy+M+JgCasZjIgHscat5x9Am4LlR3hdQuSDKG9tIx1uS6KuWbslRyUI7C+mw20LMk+yuv5EJYg1fiPiu4/UYktwoZTX9SM6QSTgPoroAWozlrj6hNX0J2pBFLDxOOLvDmo1UvRerclbmCcoM7JRlL6g9uDq8qCoeIOwpoDXIZgHkSfTUIJF+5gnFOL0HVoiQOLAJYTZO9FKWsm8wTAP8v0X7RUgyDnPPKEQN5/REn2yQLvdUsyDVL+n7QIk7lcxT7+MlifiTz9piT41feMeDcZBxOUy2i5QHV1ozdrBfMFQf2tDSTyqZh4dxkHUgtNJvJV/ipLSmDegzsxsxPa/1BogyLvCfDqMg1hj1yG2tNGeXK8a0Zq+nfslkF6I+CP0WlOC+TnMq8M8iEQUP6Q9g6tbbptPa1GcvYdw7CaKcw8Q5XnJ5PAoKupsL3SFrSBWyma5DXto78ETCISlubyvAfaCSET+ddp+0CSulbN+ptgOYo1cJV+b13QOA1ez3HLHrOX9DLEfRDFJvmKvm+lUwteXVu9uxvrYILwgiuQMFI9f0inZlqhq8K49Vt8m4QdRyG+GyC1BbPtD56eX9Igzd73bOqsbBgML4mNCJorzpaGPHT61d3jHQsomXmcADE4QH3L/VydWyDiBcPgagjzhQpH6ltxAyC5CmLcbrRH2vxEmDG6Q/8hwkFhjCAVxxv4lGh3q0oPD43Tl0Qdxh7op5L3eFOeXaobeNSef1E0hcMbBJRu5rtWS8F5v6tE/EsTHlTR3tE0AAAAASUVORK5CYII="
        alt="Unzer"
        style="border-radius: 4px;"
      />
    `;
  }

  private renderPmLogo() {
    return html`
      <svg
        part="logo"
        width="38"
        height="24"
        viewBox="0 0 38 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="pi-unzerinvoice"
      >
        <title id="pi-unzerinvoice">Unzer Invoice</title>
        <path fill="#000" opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"/>
        <path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"/>
        <path d="M6.466 15.294h5.261c1.445 0 2.631 1.152 2.631 2.591 0 1.423-1.169 2.592-2.63 2.592H6.465c-1.445 0-2.631-1.152-2.631-2.592 0-1.422 1.169-2.591 2.63-2.591zM26.602 2.524h5.846c1.875 0 3.388 1.49 3.388 3.337 0 1.846-1.513 3.336-3.388 3.336h-5.846c-1.875 0-3.388-1.49-3.388-3.336 0-1.847 1.514-3.337 3.388-3.337z" fill="#E9F2FB"/>
        <path d="M23.158 3.79l-9.366.322c-1.139.039-2.03.98-1.99 2.102l.46 13c.04 1.122.996 2 2.135 1.96l9.366-.322c1.139-.04 2.03-.98 1.99-2.102l-.46-13c-.04-1.122-.996-2-2.135-1.96z" fill="#415085"/>
        <path d="M22.034 6.545l-6.908.238a.933.933 0 00-.913.955c.018.51.456.908.978.89l6.908-.237a.933.933 0 00.913-.955.936.936 0 00-.978-.89zM22.13 9.724l-6.909.238a.933.933 0 00-.912.955c.018.51.456.908.978.89l6.908-.238a.933.933 0 00.913-.955.936.936 0 00-.978-.89zM16.609 13.096l-1.272.044a.934.934 0 00-.913.955c.019.51.456.908.978.89l1.272-.044a.933.933 0 00.913-.955.936.936 0 00-.978-.89z" fill="#F5FBFF"/>
        <path d="M26.894 18.395a.527.527 0 01.035.745l-1.187 1.253a.547.547 0 01-.757.034l-5.691-5.233a1.251 1.251 0 01-.413-.847l-.103-1a.52.52 0 01.55-.575l1.015.033c.326 0 .636.136.877.356l5.691 5.234h-.017zM28.373 19.767c.567.525.602 1.405.069 1.964a1.428 1.428 0 01-1.995.068l-.533-.491a.527.527 0 01-.034-.745l1.186-1.254c.207-.22.55-.22.757-.034l.533.492h.017z" fill="#C73A6B"/>
      </svg>
    `;
  }

  render() {
    switch (this.variant) {
      case 'icon':
        return this.renderIconLogo();
      case 'pm-logo':
        return this.renderPmLogo();
      case 'logo':
      default:
        return this.renderTextLogo();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unzer-invoice-logo': UnzerInvoiceLogo;
  }
}
