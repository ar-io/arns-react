import { PermissionType } from 'arconnect';
import { ArweaveWebWallet } from 'arweave-wallet-connector';
import { ReactiveConnector } from 'arweave-wallet-connector/lib/browser/Reactive';
import { ApiConfig } from 'arweave/node/lib/api';

import { ARCONNECT_UNRESPONSIVE_ERROR } from '../../components/layout/Notifications/Notifications';
import { ArweaveWalletConnector, WALLET_TYPES } from '../../types';
import { executeWithTimeout, sleep } from '../../utils';
import { ArweaveTransactionID } from '../arweave/ArweaveTransactionID';

export const ARCONNECT_WALLET_PERMISSIONS: PermissionType[] = [
  'ACCESS_ADDRESS',
  'ACCESS_ALL_ADDRESSES',
  'ACCESS_PUBLIC_KEY',
  'SIGN_TRANSACTION',
  'ACCESS_ARWEAVE_CONFIG',
];

export class ArweaveAppWalletConnector implements ArweaveWalletConnector {
  private _wallet: Window['arweaveWallet'];
  private _arweaveAppApi: ReactiveConnector;

  constructor() {
    const webWallet = new ArweaveWebWallet({
      name: 'ArNS',
    });
    webWallet.setUrl('arweave.app');
    this._wallet = webWallet.namespaces
      .arweaveWallet as any as Window['arweaveWallet'];
    this._arweaveAppApi = webWallet;
  }

  // The API has been shown to be unreliable, so we call each function with a timeout
  async safeArconnectApiExecutor<T>(fn: () => T): Promise<T> {
    /**
     * This is here because occasionally arconnect injects but does not initialize internally properly,
     * allowing the api to be called but then hanging.
     * This is a workaround to check that and emit appropriate errors,
     * and to trigger the workaround workflow of reloading the page and re-initializing arconnect.
     */

    const res = await executeWithTimeout(() => fn(), 20_000);

    if (res === 'timeout') {
      throw new Error(ARCONNECT_UNRESPONSIVE_ERROR);
    }
    return res as T;
  }

  async connect(): Promise<void> {
    // confirm they have the extension installed
    try {
      localStorage.setItem('walletType', WALLET_TYPES.ARWEAVE_APP);

      await this._wallet.connect(ARCONNECT_WALLET_PERMISSIONS, {
        name: 'ARNS - ar.io',
      });
    } catch (error) {
      localStorage.removeItem('walletType');
      throw {
        name: 'Arweave.app',
        message: 'User cancelled authentication.',
      };
    }
  }

  async disconnect(): Promise<void> {
    localStorage.removeItem('walletType');
    return this._wallet.disconnect();
  }

  async getWalletAddress(): Promise<ArweaveTransactionID> {
    const address = await this._wallet.getActiveAddress();
    return new ArweaveTransactionID(address);
  }

  async getGatewayConfig(): Promise<ApiConfig> {
    const config = await this._wallet.getArweaveConfig();
    return config as unknown as ApiConfig;
  }
}
