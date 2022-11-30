import { ArweaveWebWallet } from 'arweave-wallet-connector';

import { ArweaveWalletConnector } from '../../types';

export class ArConnectWalletConnector implements ArweaveWalletConnector {
  private _wallet: any;
  constructor() {
    this._wallet = new ArweaveWebWallet({
      name: 'ArNS - ar.io',
      logo: '../../public/vite.svg',
    });
    this._wallet.setUrl('arweave.app');
  }

  async connect(): Promise<Window['arweaveWallet']> {
    // confirm they have the extension installed
    if (!window.arweaveWallet) {
      window.open('https://arconnect.io');
    }
    return this._wallet.connect();
  }

  async getWalletAddress(): Promise<string> {
    return window.arweaveWallet.getActiveAddress();
  }
}
