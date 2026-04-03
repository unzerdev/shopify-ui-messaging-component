export interface UnzerIncludeErrorEventDetail {
  status: number;
}

export class UnzerIncludeErrorEvent extends CustomEvent<UnzerIncludeErrorEventDetail> {
  constructor(detail: UnzerIncludeErrorEventDetail) {
    super('unzer-include-error', {
      detail,
      bubbles: true,
      composed: true,
    });
  }
}
