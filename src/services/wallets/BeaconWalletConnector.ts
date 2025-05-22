import { TurboArNSSigner } from '@ar.io/sdk';
import { TokenType } from '@ardrive/turbo-sdk';
import { BeaconError } from '@src/utils/errors';
import eventEmitter from '@src/utils/events';
import WalletClient from '@vela-ventures/ao-sync-sdk';
import { PermissionType } from 'arconnect';
import { ApiConfig } from 'arweave/node/lib/api';

import { ArNSWalletConnector, WALLET_TYPES } from '../../types';
import { ArweaveTransactionID } from '../arweave/ArweaveTransactionID';

export const BEACON_WALLET_PERMISSIONS: PermissionType[] = [
  'ACCESS_ADDRESS',
  'ACCESS_ALL_ADDRESSES',
  'ACCESS_PUBLIC_KEY',
  'SIGN_TRANSACTION',
  'ACCESS_ARWEAVE_CONFIG',
  'SIGNATURE',
];

export class BeaconWalletConnector implements ArNSWalletConnector {
  tokenType: TokenType = 'arweave';
  public _wallet: WalletClient;
  contractSigner: Window['arweaveWallet'];
  turboSigner: TurboArNSSigner;

  constructor() {
    this._wallet = new WalletClient();
    this._wallet.reconnect();
    this.contractSigner = this._wallet as any;
    this.turboSigner = this._wallet as any;
  }
  async connect(): Promise<void> {
    localStorage.setItem('walletType', WALLET_TYPES.BEACON);

    await this._wallet
      .connect({ appInfo: { name: 'ARNS - ar.io' } })
      .catch((err) => {
        localStorage.removeItem('walletType');
        console.error(err);
        throw new BeaconError('User cancelled authentication.');
      });
  }

  async on(event: string, listener: (data: any) => void) {
    this._wallet.on(event, listener);
  }

  async off(event: string, listener: (data: any) => void) {
    this._wallet.off(event, listener);
  }

  async disconnect(): Promise<void> {
    localStorage.removeItem('walletType');
    return await this._wallet?.disconnect();
  }

  async getWalletAddress(): Promise<ArweaveTransactionID> {
    return await this._wallet
      ?.getActiveAddress()
      .then((res) => new ArweaveTransactionID(res));
  }

  async getGatewayConfig(): Promise<ApiConfig> {
    const config = await this._wallet?.getArweaveConfig();
    return config as unknown as ApiConfig;
  }

  async updatePermissions(): Promise<void> {
    // check we have the necessary permissions
    const permissions = await this._wallet.getPermissions();
    if (
      permissions &&
      !BEACON_WALLET_PERMISSIONS.every((permission) =>
        permissions.includes(permission),
      )
    ) {
      const missingPermissions = BEACON_WALLET_PERMISSIONS.filter(
        (permission) => !permissions.includes(permission),
      );
      eventEmitter.emit(
        'error',
        new Error(
          `Missing permissions (${missingPermissions.join(
            ', ',
          )}), please re-authorize permissions.`,
        ),
      );
      await this.disconnect();
      await this.connect();
    }
  }
}
