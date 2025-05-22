// NotificationOnlyError is an error that is only shown as a notification and does not emit to sentry
import { AoANTHandler, AoClient } from '@ar.io/sdk';

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

export interface ANTAuditor {
  availableApis: AoANTHandler[];
  issues: Record<AoANTHandler, Error[]>;

  audit(): Promise<Record<AoANTHandler, Error[]>>;
}
export class ANTAudit implements ANTAuditor {
  readonly processId: string;
  readonly ao: AoClient;
  availableApis: AoANTHandler[];
  issues: Record<AoANTHandler, Error[]>;
  constructor({ processId, ao }: { processId: string; ao: AoClient }) {
    this.processId = processId;
    this.ao = ao;

    this.availableApis = [];
    this.issues = {} as any;
  }

  async audit(): Promise<Record<AoANTHandler, Error[]>> {
    return this.issues;
  }
}
