export class ContractInteractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Contract Interaction Error';
  }
}

export class NoNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'No Network Detected';
  }
}
