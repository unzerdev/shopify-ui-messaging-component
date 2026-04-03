export class UnzerLoadEvent extends CustomEvent<{}> {
  constructor() {
    super('unzer-load', {
      detail: {},
      bubbles: true,
      composed: true,
    });
  }
}
