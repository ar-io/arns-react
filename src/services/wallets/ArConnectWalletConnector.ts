import { defaultLogger } from '@src/utils/constants';
import { ArconnectError, WalletNotInstalledError } from '@src/utils/errors';
import eventEmitter from '@src/utils/events';
import { PermissionType } from 'arconnect';
import { ApiConfig } from 'arweave/node/lib/api';

import { ARCONNECT_UNRESPONSIVE_ERROR } from '../../components/layout/Notifications/Notifications';
import { ArweaveWalletConnector, WALLET_TYPES } from '../../types';
import { executeWithTimeout } from '../../utils';
import { ArweaveTransactionID } from '../arweave/ArweaveTransactionID';

export const ARCONNECT_WALLET_PERMISSIONS: PermissionType[] = [
  'ACCESS_ADDRESS',
  'ACCESS_ALL_ADDRESSES',
  'ACCESS_PUBLIC_KEY',
  'SIGN_TRANSACTION',
  'ACCESS_ARWEAVE_CONFIG',
  'SIGNATURE',
];

export class ArConnectWalletConnector implements ArweaveWalletConnector {
  private _wallet: Window['arweaveWallet'];
  arconnectSigner: Window['arweaveWallet'];
  constructor() {
    this._wallet = window?.arweaveWallet;
    this.arconnectSigner = window?.arweaveWallet;
  }

  // The API has been shown to be unreliable, so we call each function with a timeout
  async safeArconnectApiExecutor<T>(fn: () => T): Promise<T> {
    if (!this._wallet)
      throw new WalletNotInstalledError('Arconnect is not installed.');
    /**
     * This is here because occasionally arconnect injects but does not initialize internally properly,
     * allowing the api to be called but then hanging.
     * This is a workaround to check that and emit appropriate errors,
     * and to trigger the workaround workflow of reloading the page and re-initializing arconnect.
     */
    const res = await executeWithTimeout(() => fn(), 3000);

    if (res === 'timeout') {
      throw new Error(ARCONNECT_UNRESPONSIVE_ERROR);
    }
    return res as T;
  }

  async connect(): Promise<void> {
    if (!window.arweaveWallet) {
      window.open('https://arconnect.io');

      return;
    }
    // confirm they have the extension installed
    localStorage.setItem('walletType', WALLET_TYPES.ARCONNECT);
    const permissions = await this.safeArconnectApiExecutor(
      this._wallet?.getPermissions,
    );
    if (
      permissions &&
      !ARCONNECT_WALLET_PERMISSIONS.every((permission) =>
        permissions.includes(permission),
      )
    ) {
      // disconnect due to missing permissions, then re-connect
      await this.safeArconnectApiExecutor(this._wallet?.disconnect);
    } else if (permissions) {
      return;
    }

    await this._wallet
      .connect(
        ARCONNECT_WALLET_PERMISSIONS,
        {
          name: 'ARNS - ar.io',
        },
        // TODO: add arweave configs here
      )
      .catch((err) => {
        localStorage.removeItem('walletType');
        defaultLogger.error(err);
        throw new ArconnectError('User cancelled authentication.');
      });
  }

  async disconnect(): Promise<void> {
    localStorage.removeItem('walletType');
    return this.safeArconnectApiExecutor(this._wallet?.disconnect);
  }

  async getWalletAddress(): Promise<ArweaveTransactionID> {
    return this.safeArconnectApiExecutor(() =>
      this._wallet
        ?.getActiveAddress()
        .then((res) => new ArweaveTransactionID(res)),
    );
  }

  async getGatewayConfig(): Promise<ApiConfig> {
    const config = await this.safeArconnectApiExecutor(
      this._wallet?.getArweaveConfig,
    );
    return config as unknown as ApiConfig;
  }

  async updatePermissions(): Promise<void> {
    // check we have the necessary permissions
    const permissions = await this._wallet.getPermissions();
    if (
      permissions &&
      !ARCONNECT_WALLET_PERMISSIONS.every((permission) =>
        permissions.includes(permission),
      )
    ) {
      const missingPermissions = ARCONNECT_WALLET_PERMISSIONS.filter(
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
