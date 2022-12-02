import { ArweaveWalletConnector } from '../../types';
import { APP_INFO, WALLET_PERMISSIONS } from '../../utils/constants';

export class ArConnectWalletConnector implements ArweaveWalletConnector {
  private _wallet: any;
  constructor() {
    this._wallet = window.arweaveWallet;
  }

  async connect() {
    // confirm they have the extension installed
    if (!window.arweaveWallet) {
      window.open('https://arconnect.io');
    }
    return this._wallet.connect(WALLET_PERMISSIONS, APP_INFO);
  }

  async getWalletAddress(): Promise<string> {
    return this._wallet.getActiveAddress();
  }
}
