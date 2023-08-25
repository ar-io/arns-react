import { PermissionType } from 'arconnect';
import { ApiConfig } from 'arweave/node/lib/api';

import { ArweaveTransactionID } from '../../types';
import { ArweaveWalletConnector } from '../../types';

const ARCONNECT_WALLET_PERMISSIONS: PermissionType[] = [
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

  async connect(): Promise<void> {
    // confirm they have the extension installed
    if (!window.arweaveWallet) {
      window.open('https://arconnect.io');
    }

    const address = await this._wallet
      .getActiveAddress()
      .catch(() => undefined);

    if (address) {
      return;
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
  async getGatewayConfig(): Promise<ApiConfig> {
    const config = await this._wallet.getArweaveConfig();
    return config as unknown as ApiConfig;
  }
}
