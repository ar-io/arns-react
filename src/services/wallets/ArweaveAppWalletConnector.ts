import { TurboArNSSigner } from '@ar.io/sdk/web';
import { TokenType } from '@ardrive/turbo-sdk';
import { ARWEAVE_APP_API } from '@src/utils/constants';
import { ArweaveAppError } from '@src/utils/errors';

import { WANDER_UNRESPONSIVE_ERROR } from '../../components/layout/Notifications/Notifications';
import { ArNSWalletConnector, WALLET_TYPES } from '../../types';
import { executeWithTimeout } from '../../utils';
import { ArweaveTransactionID } from '../arweave/ArweaveTransactionID';

export class ArweaveAppWalletConnector implements ArNSWalletConnector {
  tokenType: TokenType = 'arweave';
  // NOTE: this is intended to be ReactiveConnector from arweave-web-wallet but their exports don't export these directl
  // previously: private _wallet: ReactiveConnector & { namespaces: any };
  private _wallet: any;
  contractSigner?: Window['arweaveWallet'];
  turboSigner: TurboArNSSigner;

  constructor() {
    const handler = {
      get: (target: any, prop: string) => {
        if (prop === 'signMessage') {
          return async (data: ArrayBuffer) => {
            return await ARWEAVE_APP_API.signMessage(Buffer.from(data), {
              hashAlgorithm: 'SHA-256',
            });
          };
        }
        return target[prop];
      },
    };

    this._wallet = new Proxy(ARWEAVE_APP_API as any, handler);
    this.contractSigner = this._wallet as any;
    Object.assign(this._wallet, {
      getActivePublicKey: ARWEAVE_APP_API.getPublicKey,
    });

    this.turboSigner = this._wallet as any;
  }

  // The API has been shown to be unreliable, so we call each function with a timeout
  async safeWanderApiExecutor<T>(fn: () => T): Promise<T> {
    /**
     * This is here because occasionally wander injects but does not initialize internally properly,
     * allowing the api to be called but then hanging.
     * This is a workaround to check that and emit appropriate errors,
     * and to trigger the workaround workflow of reloading the page and re-initializing wander.
     */

    const res = await executeWithTimeout(() => fn(), 20_000);

    if (res === 'timeout') {
      throw new Error(WANDER_UNRESPONSIVE_ERROR);
    }
    return res as T;
  }

  async connect(): Promise<void> {
    // confirm they have the extension installed
    try {
      localStorage.setItem('walletType', WALLET_TYPES.ARWEAVE_APP);

      await this._wallet.namespaces.arweaveWallet.connect({
        name: 'ARNS - ar.io',
      });
    } catch (error) {
      localStorage.removeItem('walletType');
      throw new ArweaveAppError('User cancelled authentication.');
    }
  }

  async disconnect(): Promise<void> {
    localStorage.removeItem('walletType');
    return this._wallet.namespaces.arweaveWallet.disconnect();
  }

  async getWalletAddress(): Promise<ArweaveTransactionID> {
    const address =
      await this._wallet.namespaces.arweaveWallet.getActiveAddress();
    return new ArweaveTransactionID(address);
  }
}
