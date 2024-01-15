import { ARWEAVE_APP_API } from '@src/utils/constants';
import { ArweaveAppError } from '@src/utils/errors';
import { PermissionType } from 'arconnect';
import { ReactiveConnector } from 'arweave-wallet-connector/lib/browser/Reactive';
import { ApiConfig } from 'arweave/node/lib/api';
import { CustomSignature, SignatureType, Transaction } from 'warp-contracts';

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
];

export class ArweaveAppWalletConnector implements ArweaveWalletConnector {
  private _wallet: ReactiveConnector & { namespaces: any };
  signer: CustomSignature;

  constructor() {
    this._wallet = ARWEAVE_APP_API as any;
    this.signer = {
      signer: async (transaction: Transaction) => {
        await ARWEAVE_APP_API.signTransaction(transaction);
      },
      type: 'arweave' as SignatureType,
    };
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

      await this._wallet.connect({
        name: 'ARNS - ar.io',
      });

      this.signer.signer.bind(this);
    } catch (error) {
      localStorage.removeItem('walletType');
      throw new ArweaveAppError('User cancelled authentication.');
    }
  }

  async disconnect(): Promise<void> {
    localStorage.removeItem('walletType');
    return await this._wallet.disconnect();
  }

  async getWalletAddress(): Promise<ArweaveTransactionID> {
    const address =
      await this._wallet.namespaces.arweaveWallet.getActiveAddress();
    return new ArweaveTransactionID(address);
  }

  async getGatewayConfig(): Promise<ApiConfig> {
    return {
      host: 'ar-io.dev',
      port: 443,
      protocol: 'https',
    };
  }
}
