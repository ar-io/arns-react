import { ArweaveWalletConnector } from '../../types';

const ARCONNECT_WALLET_PERMISSIONS = [
  'ACCESS_ADDRESS',
  'ACCESS_PUBLIC_KEY',
  'SIGN_TRANSACTION',
  'ENCRYPT',
  'DECRYPT',
  'ACCESS_ARWEAVE_CONFIG',
];

export class ArConnectWalletConnector implements ArweaveWalletConnector {
  private _wallet: any;

  constructor() {
    this._wallet = window.arweaveWallet;
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
}
