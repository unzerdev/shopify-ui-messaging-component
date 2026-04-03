import { html, css, CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ConfigObject } from '@unzer/messaging-core';
import { UnzerElement } from '@unzer/messaging-core';
import { logger } from '@unzer/messaging-core';

/**
 * @summary Unzer Logo component with multiple brand variants
 *
 * @example
 * ```html
 * <unzer-logo variant="logo"></unzer-logo>
 * <unzer-logo variant="icon"></unzer-logo>
 * <unzer-logo variant="pm-logo"></unzer-logo>
 * ```
 * @csspart logo - The logo SVG container
 */
@customElement('unzer-logo')
export class UnzerLogo extends UnzerElement {
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

  /** Logo width in pixels */
  @property({ type: Number })
  width = 97;

  /** Logo height in pixels */
  @property({ type: Number })
  height = 22;

  /** Logo variant: logo (text), icon (brand icon), pm-logo (payment method) */
  @property({ type: String })
  variant: 'logo' | 'icon' | 'pm-logo' = 'logo';

  /** Custom CSS configuration for logo styling */
  @property({
    type: Object,
    attribute: 'css-config',
    converter: {
      fromAttribute: (value: string | null): ConfigObject => {
        if (!value) return {};
        try {
          return JSON.parse(value);
        } catch {
          logger.warn('Invalid CSS config JSON', 'UnzerLogo', { value });
          return {};
        }
      },
      toAttribute: (value: ConfigObject): string => {
        return JSON.stringify(value);
      }
    }
  })
  cssConfig: ConfigObject = {};

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
        <g clip-path="url(#clip0_logo)">
          <path d="M26.4259 4.98816V13.7457H22.8276V6.42232C22.8276 4.61769 21.4902 3.64379 20.2323 3.64379C19.1425 3.64379 18.2909 4.16685 17.473 5.34042V13.7463H13.8748V7.28322C13.5115 7.40943 13.1383 7.51555 12.7712 7.5978C12.5787 11.3251 9.95515 13.9824 6.39125 13.9824C2.68793 13.9824 0 11.1129 0 7.15946V0.302655H3.59891V7.15946C3.59891 8.63947 4.33044 10.3681 6.39187 10.3681C8.28823 10.3681 9.05913 8.90512 9.16983 7.518C7.67488 6.88635 6.74951 5.36428 6.74951 3.34302C6.74951 1.24955 8.30385 0.0182091 9.80319 0.0182091C11.7215 0.0182091 12.7831 1.93712 12.7731 3.8441C12.7731 3.8441 13.3052 3.65259 13.8748 3.32795V0.302027H17.473V1.45551C18.7042 0.449587 19.8409 0 21.1526 0C22.6019 0 23.9381 0.509239 24.9141 1.43416C25.8895 2.35845 26.4259 3.62056 26.4259 4.98816ZM27.8609 3.48869H33.9533L27.5339 11.1493L27.5289 11.1549V13.7457H38.9358V10.5647H32.4802L38.9308 2.80176L38.9358 2.79611V0.302655H27.8609V3.48869ZM50.5948 1.88061C51.8015 3.11006 52.4392 4.85442 52.4392 6.92528V8.17229H42.7717C43.0212 9.83066 44.2085 10.8196 45.9517 10.8196C47.4003 10.8196 48.6533 10.2344 49.2211 9.29313L49.2304 9.27682L49.2473 9.28438L52.0684 10.5603L52.0584 10.5804C50.9311 12.7536 48.6871 14 45.9004 14C41.8989 14 39.2103 11.1976 39.2103 7.02639C39.2103 5.05974 39.9237 3.26642 41.2192 1.97605C42.4641 0.735917 44.1266 0.0527446 45.9011 0.0527446C47.7986 0.0533726 49.4212 0.685056 50.5948 1.88061ZM48.9354 5.34733C48.6396 3.95963 47.5073 3.13267 45.9011 3.13267C44.4355 3.13267 43.3088 3.95963 42.8824 5.34733H48.9354ZM61.4552 0.204072C60.9782 0.0533728 60.4355 0.0533722 60.4355 0.0533722C59.255 0.0533722 58.1164 0.511123 57.1404 1.37702V0.302655H53.5421V13.7463H57.1404V5.40824C57.8501 4.0557 58.9392 3.31099 60.2072 3.31099C60.2072 3.31099 60.7774 3.31602 61.1326 3.42088L61.4552 0.204072Z" fill="#F21C58"/>
        </g>
        <defs>
          <clipPath id="clip0_logo">
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
        width="40"
        height="24"
        viewBox="0 0 40 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="0.5" y="0.5" width="39" height="23" rx="3.5" fill="white"/>
        <rect x="0.5" y="0.5" width="39" height="23" rx="3.5" stroke="#DBDCE0"/>
        <path d="M4.81485 2.77779H10.0768C11.5212 2.77779 12.7077 3.92952 12.7077 5.36918C12.7077 6.7919 11.5384 7.96057 10.0768 7.96057H4.81485C3.37041 7.96057 2.1839 6.80884 2.1839 5.36918C2.1839 3.94645 3.35321 2.77779 4.81485 2.77779Z" fill="url(#paint0_pm)"/>
        <path d="M26.6878 7.84203H32.5344C34.4087 7.84203 35.9219 9.3325 35.9219 11.1787C35.9219 13.0248 34.4087 14.5153 32.5344 14.5153H26.6878C24.8135 14.5153 23.3002 13.0248 23.3002 11.1787C23.3002 9.3325 24.8135 7.84203 26.6878 7.84203Z" fill="url(#paint1_pm)"/>
        <path d="M9.99858 8.98819L9.87824 15.779C9.83846 18.0236 11.6536 19.875 13.9326 19.9142L24.7643 20.1004C27.0432 20.1396 28.9229 18.3517 28.9626 16.1071L29.083 9.3163C29.1228 7.07165 27.3076 5.22023 25.0286 5.18105L14.197 4.99483C11.918 4.95565 10.0384 6.74354 9.99858 8.98819Z" fill="url(#paint2_pm)"/>
        <path d="M10.0226 7.63342L9.85423 17.1337C9.82771 18.6302 11.0378 19.8645 12.5571 19.8906L26.1397 20.1241C27.659 20.1502 28.9121 18.9583 28.9386 17.4618L29.107 7.96153C29.1335 6.4651 27.9234 5.23082 26.4041 5.2047L12.8215 4.97118C11.3022 4.94506 10.0491 6.13699 10.0226 7.63342Z" fill="url(#paint3_pm)"/>
        <path d="M10.0594 5.50421C10.0594 5.1824 10.3345 4.92834 10.6612 4.92834L28.562 5.23321C28.8887 5.23321 29.1467 5.50421 29.1467 5.82602L29.0779 9.46751C29.0779 9.63688 28.9403 9.75544 28.7684 9.75544L10.2829 9.43364C10.111 9.43364 9.9906 9.29814 9.9906 9.12877L10.0594 5.48727V5.50421Z" fill="url(#paint4_pm)"/>
        <path d="M11.7808 16.735L11.7898 16.227C11.803 15.4819 12.4327 14.8829 13.1892 14.8959L14.9601 14.9263C15.7166 14.9393 16.3248 15.5596 16.3116 16.3047L16.3026 16.8128C16.2894 17.5579 15.6596 18.1569 14.9031 18.1439L13.1322 18.1135C12.3757 18.1005 11.7676 17.4802 11.7808 16.735Z" fill="url(#paint5_pm)"/>
        <path d="M17.2065 12.8409L17.2155 12.3329C17.2287 11.5878 17.8585 10.9888 18.615 11.0018L20.3859 11.0322C21.1424 11.0452 21.7505 11.6655 21.7373 12.4106L21.7283 12.9187C21.7151 13.6638 21.0853 14.2628 20.3288 14.2498L18.5579 14.2194C17.8014 14.2064 17.1933 13.5861 17.2065 12.8409Z" fill="url(#paint6_pm)"/>
        <path d="M17.1358 16.8392L17.1448 16.3312C17.158 15.586 17.7878 14.987 18.5443 15L20.3152 15.0305C21.0717 15.0435 21.6798 15.6638 21.6666 16.4089L21.6576 16.9169C21.6444 17.6621 21.0147 18.2611 20.2582 18.2481L18.4873 18.2176C17.7308 18.2046 17.1226 17.5843 17.1358 16.8392Z" fill="url(#paint7_pm)"/>
        <path d="M22.5446 12.9434L22.5536 12.4353C22.5668 11.6902 23.1966 11.0912 23.9531 11.1042L25.724 11.1347C26.4805 11.1477 27.0886 11.768 27.0754 12.5131L27.0664 13.0211C27.0532 13.7662 26.4235 14.3652 25.667 14.3522L23.8961 14.3218C23.1396 14.3088 22.5314 13.6885 22.5446 12.9434Z" fill="url(#paint9_pm)"/>
        <path d="M13.9114 3.31848H13.7738C13.4414 3.31848 13.1719 3.58389 13.1719 3.91128V6.45186C13.1719 6.77926 13.4414 7.04466 13.7738 7.04466H13.9114C14.2437 7.04466 14.5132 6.77926 14.5132 6.45186V3.91128C14.5132 3.58389 14.2437 3.31848 13.9114 3.31848Z" fill="url(#paint11_pm)"/>
        <path d="M19.6718 3.3185H19.5342C19.2018 3.3185 18.9324 3.5839 18.9324 3.9113V6.45188C18.9324 6.77927 19.2018 7.04468 19.5342 7.04468H19.6718C20.0042 7.04468 20.2736 6.77927 20.2736 6.45188V3.9113C20.2736 3.5839 20.0042 3.3185 19.6718 3.3185Z" fill="url(#paint12_pm)"/>
        <path d="M25.4325 3.3185H25.2949C24.9625 3.3185 24.6931 3.5839 24.6931 3.9113V6.45188C24.6931 6.77927 24.9625 7.04468 25.2949 7.04468H25.4325C25.7649 7.04468 26.0343 6.77927 26.0343 6.45188V3.9113C26.0343 3.5839 25.7649 3.3185 25.4325 3.3185Z" fill="url(#paint13_pm)"/>
        <defs>
          <linearGradient id="paint0_pm" x1="7.89289" y1="2.74391" x2="7.09149" y2="7.64269" gradientUnits="userSpaceOnUse"><stop stop-color="white"/><stop offset="1" stop-color="#E9F2FB"/></linearGradient>
          <linearGradient id="paint1_pm" x1="30.2129" y1="7.80815" x2="29.1109" y2="14.0807" gradientUnits="userSpaceOnUse"><stop stop-color="white"/><stop offset="1" stop-color="#E9F2FB"/></linearGradient>
          <linearGradient id="paint2_pm" x1="21.4248" y1="5.71198" x2="17.8943" y2="18.4839" gradientUnits="userSpaceOnUse"><stop stop-color="white"/><stop offset="1" stop-color="#F4F9FD"/></linearGradient>
          <linearGradient id="paint3_pm" x1="21.4616" y1="5.5771" x2="17.8599" y2="18.6024" gradientUnits="userSpaceOnUse"><stop stop-color="white"/><stop offset="1" stop-color="#E9F2FB"/></linearGradient>
          <linearGradient id="paint4_pm" x1="19.603" y1="5.09772" x2="19.5363" y2="9.60304" gradientUnits="userSpaceOnUse"><stop stop-color="#415084"/><stop offset="1" stop-color="#272E4F"/></linearGradient>
          <linearGradient id="paint5_pm" x1="14.1349" y1="14.9121" x2="14.0796" y2="18.1297" gradientUnits="userSpaceOnUse"><stop stop-color="#415084"/><stop offset="1" stop-color="#272E4F"/></linearGradient>
          <linearGradient id="paint6_pm" x1="19.5434" y1="11.0177" x2="19.4881" y2="14.2353" gradientUnits="userSpaceOnUse"><stop stop-color="#415084"/><stop offset="1" stop-color="#272E4F"/></linearGradient>
          <linearGradient id="paint7_pm" x1="19.4899" y1="15.0163" x2="19.4346" y2="18.2339" gradientUnits="userSpaceOnUse"><stop stop-color="#C73A6B"/><stop offset="1" stop-color="#C63057"/></linearGradient>
          <linearGradient id="paint9_pm" x1="24.8987" y1="11.1205" x2="24.8434" y2="14.3381" gradientUnits="userSpaceOnUse"><stop stop-color="#C73A6B"/><stop offset="1" stop-color="#C63057"/></linearGradient>
          <linearGradient id="paint11_pm" x1="14.1349" y1="3.53866" x2="13.6006" y2="6.57323" gradientUnits="userSpaceOnUse"><stop stop-color="#C73A6B"/><stop offset="1" stop-color="#C63057"/></linearGradient>
          <linearGradient id="paint12_pm" x1="19.8953" y1="3.53868" x2="19.361" y2="6.57324" gradientUnits="userSpaceOnUse"><stop stop-color="#C73A6B"/><stop offset="1" stop-color="#C63057"/></linearGradient>
          <linearGradient id="paint13_pm" x1="25.656" y1="3.53868" x2="25.1217" y2="6.57324" gradientUnits="userSpaceOnUse"><stop stop-color="#C73A6B"/><stop offset="1" stop-color="#C63057"/></linearGradient>
        </defs>
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
    'unzer-logo': UnzerLogo;
  }
}
