export class ContractInteractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Contract Interaction Error';
  }
}

export class WalletNotInstalledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Wallet Not Installed';
  }
}
