import Arweave from 'arweave';
import Ar from 'arweave/node/ar';

import { ArweaveWalletConnector } from '../../types';

const ARCONNECT_WALLET_PERMISSIONS = [
  'ACCESS_ADDRESS',
  'ACCESS_ALL_ADDRESSES',
  'ACCESS_PUBLIC_KEY',
  'SIGN_TRANSACTION',
];

export class ArConnectWalletConnector implements ArweaveWalletConnector {
  private _wallet: any;
  private _arweave: Arweave;
  private _ar: Ar = new Ar();

  constructor(arweave: Arweave) {
    this._wallet = window.arweaveWallet;
    this._arweave = arweave;
  }

  connect(): Promise<void> {
    // confirm they have the extension installed
    if (!window.arweaveWallet) {
      window.open('https://arconnect.io');
    }
    return this._wallet.connect(ARCONNECT_WALLET_PERMISSIONS, {
      name: 'ArNS - ar.io',
    });
  }

  disconnect(): Promise<void> {
    return this._wallet.disconnect();
  }

  getWalletAddress(): Promise<string> {
    return this._wallet.getActiveAddress();
  }

  async getWalletBalanceAR(): Promise<string> {
    const winstonBalance = await this._arweave.wallets.getBalance(
      await this.getWalletAddress(),
    );
    return this._ar.winstonToAr(winstonBalance);
  }
}
