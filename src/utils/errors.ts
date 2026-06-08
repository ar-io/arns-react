// NotificationOnlyError is an error that is only shown as a notification and does not emit to sentry

export class NotificationOnlyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Error Notification';
  }
}

export class ValidationError extends NotificationOnlyError {
  constructor(message: string) {
    super(message);
    this.name = 'Validation Error';
  }
}

export class WanderError extends NotificationOnlyError {
  constructor(message: string) {
    super(message);
    this.name = 'Wander';
  }
}

export class ArweaveAppError extends NotificationOnlyError {
  constructor(message: string) {
    super(message);
    this.name = 'Arweave.app';
  }
}

export class MetamaskError extends NotificationOnlyError {
  constructor(message: string) {
    super(message);
    this.name = 'Metamask';
  }
}

export class EthereumWalletError extends NotificationOnlyError {
  constructor(message: string) {
    super(message);
    this.name = 'Ethereum Wallet';
  }
}

export class BeaconError extends NotificationOnlyError {
  constructor(message: string) {
    super(message);
    this.name = 'Beacon';
  }
}

export class InsufficientFundsError extends NotificationOnlyError {
  constructor(message: string) {
    super(message);
    this.name = 'Insufficient Funds';
  }
}

export class WalletNotInstalledError extends NotificationOnlyError {
  constructor(message: string) {
    super(message);
    this.name = 'Wallet Not Installed';
  }
}

export class UpgradeRequiredError extends NotificationOnlyError {
  constructor(message: string) {
    super(message);
    this.name = 'Upgrade Required';
  }
}

export class ANTStateError extends NotificationOnlyError {
  constructor(message: string) {
    super(message);
    this.name = 'ANT State';
  }
}

export class BaseTokenError extends NotificationOnlyError {
  constructor(message: string) {
    super(message);
    this.name = 'Base Network';
  }
}

export class TopUpError extends NotificationOnlyError {
  constructor(message: string) {
    super(message);
    this.name = 'Top Up';
  }
}

export interface ANTAuditor {
  availableApis: string[];
  issues: Record<string, Error[]>;

  audit(): Promise<Record<string, Error[]>>;
}
export class ANTAudit implements ANTAuditor {
  readonly processId: string;
  availableApis: string[];
  issues: Record<string, Error[]>;
  constructor({ processId }: { processId: string }) {
    this.processId = processId;

    this.availableApis = [];
    this.issues = {};
  }

  async audit(): Promise<Record<string, Error[]>> {
    return this.issues;
  }
}
