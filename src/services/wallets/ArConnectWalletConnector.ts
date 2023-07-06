import { PermissionType } from 'arconnect';

import { ArweaveTransactionID } from '../../types';
import { ArweaveWalletConnector } from '../../types';

const ARCONNECT_WALLET_PERMISSIONS: PermissionType[] = [
  'ACCESS_ADDRESS',
  'ACCESS_ALL_ADDRESSES',
  'ACCESS_PUBLIC_KEY',
  'SIGN_TRANSACTION',
];

export class ArConnectWalletConnector implements ArweaveWalletConnector {
  private _wallet: Window['arweaveWallet'];

  constructor() {
    this._wallet = window.arweaveWallet;
  }

  connect(): Promise<void> {
    // confirm they have the extension installed
    if (!window.arweaveWallet) {
      window.open('https://arconnect.io');
    }

    return this._wallet.connect(
      ARCONNECT_WALLET_PERMISSIONS,
      {
        name: 'ARNS - ar.io',
      },
      // TODO: add arweave configs here
    );
  }

  disconnect(): Promise<void> {
    return this._wallet.disconnect();
  }

  getWalletAddress(): Promise<ArweaveTransactionID> {
    return this._wallet
      .getActiveAddress()
      .then((res) => new ArweaveTransactionID(res));
  }
}
