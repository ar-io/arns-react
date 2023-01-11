import { PermissionType } from 'arconnect';
import Arweave from 'arweave';
import Ar from 'arweave/node/ar';

import { ArweaveTransactionId, ArweaveWalletConnector } from '../../types';
import { ArweaveGraphQL } from '../arweave/ArweaveGraphQL';

const ARCONNECT_WALLET_PERMISSIONS: PermissionType[] = [
  'ACCESS_ADDRESS',
  'ACCESS_ALL_ADDRESSES',
  'ACCESS_PUBLIC_KEY',
  'SIGN_TRANSACTION',
];

export class ArConnectWalletConnector
  implements ArweaveWalletConnector, ArweaveGraphQL
{
  private _wallet: Window['arweaveWallet'];
  private _ar: Ar = new Ar();
  private _address?: ArweaveTransactionId;
  private _graphql: ArweaveGraphQL;

  arweave: Arweave;

  constructor(
    arweave: Arweave,
    graphql: ArweaveGraphQL = new ArweaveGraphQL(arweave),
  ) {
    this._wallet = window.arweaveWallet;
    this._graphql = graphql;
    this.arweave = arweave;
  }

  connect(): Promise<void> {
    // confirm they have the extension installed
    if (!window.arweaveWallet) {
      window.open('https://arconnect.io');
    }

    return this._wallet.connect(
      ARCONNECT_WALLET_PERMISSIONS,
      {
        name: 'ArNS - ar.io',
      },
      // TODO: add arweave configs here
    );
  }

  disconnect(): Promise<void> {
    return this._wallet.disconnect();
  }

  getWalletAddress(): Promise<string> {
    return this._wallet.getActiveAddress();
  }

  async getWalletBalanceAR(): Promise<string> {
    const winstonBalance = await this.arweave.wallets.getBalance(
      await this.getWalletAddress(),
    );
    return this._ar.winstonToAr(winstonBalance);
  }

  async getWalletANTs(approvedANTSourceCodeTxs: string[], cursor?: string) {
    // TODO: why do we need to call a promise before fetching the address
    const addresses = await this._wallet.getAllAddresses();
    const currentAddress = await this.getWalletAddress();
    if (!addresses.includes(currentAddress)) {
      throw Error('Wallet address is invalid');
    }
    return this._graphql.getWalletANTs(
      approvedANTSourceCodeTxs,
      currentAddress,
      cursor,
    );
  }
}
