import { PermissionType } from 'arconnect';
import { ApiConfig } from 'arweave/node/lib/api';

import { ARCONNECT_UNRESPONSIVE_ERROR } from '../../components/layout/Notifications/Notifications';
import { ArweaveWalletConnector } from '../../types';
import { executeWithTimeout } from '../../utils';
import { ArweaveTransactionID } from '../arweave/ArweaveTransactionID';

export const ARCONNECT_WALLET_PERMISSIONS: PermissionType[] = [
  'ACCESS_ADDRESS',
  'ACCESS_ALL_ADDRESSES',
  'ACCESS_PUBLIC_KEY',
  'SIGN_TRANSACTION',
  'ACCESS_ARWEAVE_CONFIG',
];

export class ArConnectWalletConnector implements ArweaveWalletConnector {
  private _wallet: Window['arweaveWallet'];

  constructor() {
    this._wallet = window.arweaveWallet;
  }

  async validateArconnectResponsive(): Promise<void> {
    /**
     * This is here because occasionally arconnect injects but does not initialize internally properly,
     * allowing the api to be called but then hanging.
     * This is a workaround to check that and emit appropriate errors,
     * and to trigger the workaround workflow of reloading the page and re-initializing arconnect.
     */
    const isResponsive = await executeWithTimeout(async () => {
      // can test this with sleep(4000)
      return this._wallet.getPermissions();
    }, 3000);

    if (isResponsive === 'timeout') {
      console.log(isResponsive);
      throw {
        name: 'ArConnect',
        message: ARCONNECT_UNRESPONSIVE_ERROR,
      };
    }
  }

  async connect(): Promise<void> {
    // confirm they have the extension installed
    await this.validateArconnectResponsive();
    const permissions = await this._wallet.getPermissions();
    if (
      permissions &&
      !ARCONNECT_WALLET_PERMISSIONS.every((permission) =>
        permissions.includes(permission),
      )
    ) {
      // disconnect due to missing permissions, then re-connect
      await this._wallet.disconnect();
    } else if (permissions) {
      return;
    }

    return this._wallet
      .connect(
        ARCONNECT_WALLET_PERMISSIONS,
        {
          name: 'ARNS - ar.io',
        },
        // TODO: add arweave configs here
      )
      .catch((err) => {
        console.error(err);
        throw { name: 'ArConnect', message: 'User cancelled authentication.' };
      });
  }

  async disconnect(): Promise<void> {
    await this.validateArconnectResponsive();
    return this._wallet.disconnect();
  }

  async getWalletAddress(): Promise<ArweaveTransactionID> {
    await this.validateArconnectResponsive();
    return this._wallet
      .getActiveAddress()
      .then((res) => new ArweaveTransactionID(res));
  }

  async getGatewayConfig(): Promise<ApiConfig> {
    await this.validateArconnectResponsive();
    const config = await this._wallet.getArweaveConfig();
    return config as unknown as ApiConfig;
  }
}
