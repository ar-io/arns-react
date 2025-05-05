import { TurboArNSSigner } from '@ar.io/sdk';
import { TokenType } from '@ardrive/turbo-sdk';
import { WalletNotInstalledError, WanderError } from '@src/utils/errors';
import eventEmitter from '@src/utils/events';
import { PermissionType } from 'arconnect';
import { ApiConfig } from 'arweave/node/lib/api';

import { WANDER_UNRESPONSIVE_ERROR } from '../../components/layout/Notifications/Notifications';
import { ArNSWalletConnector, WALLET_TYPES } from '../../types';
import { executeWithTimeout } from '../../utils';
import { ArweaveTransactionID } from '../arweave/ArweaveTransactionID';

export const WANDER_WALLET_PERMISSIONS: PermissionType[] = [
  'ACCESS_ADDRESS',
  'ACCESS_ALL_ADDRESSES',
  'ACCESS_PUBLIC_KEY',
  'SIGN_TRANSACTION',
  'ACCESS_ARWEAVE_CONFIG',
  'SIGNATURE',
];

export class WanderWalletConnector implements ArNSWalletConnector {
  tokenType: TokenType = 'arweave';
  private _wallet: Window['arweaveWallet'];
  contractSigner: Window['arweaveWallet'];
  turboSigner: TurboArNSSigner;
  constructor() {
    this._wallet = window?.arweaveWallet;
    this.contractSigner = window?.arweaveWallet;
    this.turboSigner = window?.arweaveWallet;
  }

  // The API has been shown to be unreliable, so we call each function with a timeout
  async safeWanderApiExecutor<T>(fn: () => T): Promise<T> {
    if (!this._wallet)
      throw new WalletNotInstalledError('Wander is not installed.');
    /**
     * This is here because occasionally wander injects but does not initialize internally properly,
     * allowing the api to be called but then hanging.
     * This is a workaround to check that and emit appropriate errors,
     * and to trigger the workaround workflow of reloading the page and re-initializing wander.
     */
    const res = await executeWithTimeout(() => fn(), 3000);

    if (res === 'timeout') {
      throw new Error(WANDER_UNRESPONSIVE_ERROR);
    }
    return res as T;
  }

  async connect(): Promise<void> {
    if (!window.arweaveWallet) {
      window.open('https://wander.app/download');

      return;
    }
    // confirm they have the extension installed
    localStorage.setItem('walletType', WALLET_TYPES.WANDER);
    const permissions = await this.safeWanderApiExecutor(
      this._wallet?.getPermissions,
    );
    if (
      permissions &&
      !WANDER_WALLET_PERMISSIONS.every((permission) =>
        permissions.includes(permission),
      )
    ) {
      // disconnect due to missing permissions, then re-connect
      await this.safeWanderApiExecutor(this._wallet?.disconnect);
    } else if (permissions) {
      return;
    }

    await this._wallet
      .connect(
        WANDER_WALLET_PERMISSIONS,
        {
          name: 'ARNS - ar.io',
        },
        // TODO: add arweave configs here
      )
      .catch((err) => {
        localStorage.removeItem('walletType');
        console.error(err);
        throw new WanderError('User cancelled authentication.');
      });
  }

  async disconnect(): Promise<void> {
    localStorage.removeItem('walletType');
    return this.safeWanderApiExecutor(this._wallet?.disconnect);
  }

  async getWalletAddress(): Promise<ArweaveTransactionID> {
    return this.safeWanderApiExecutor(() =>
      this._wallet
        ?.getActiveAddress()
        .then((res) => new ArweaveTransactionID(res)),
    );
  }

  async getGatewayConfig(): Promise<ApiConfig> {
    const config = await this.safeWanderApiExecutor(
      this._wallet?.getArweaveConfig,
    );
    return config as unknown as ApiConfig;
  }

  async updatePermissions(): Promise<void> {
    // check we have the necessary permissions
    const permissions = await this._wallet.getPermissions();
    if (
      permissions &&
      !WANDER_WALLET_PERMISSIONS.every((permission) =>
        permissions.includes(permission),
      )
    ) {
      const missingPermissions = WANDER_WALLET_PERMISSIONS.filter(
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
