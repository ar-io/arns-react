import { PermissionType } from 'arconnect';
import Arweave from 'arweave';
import Ar from 'arweave/node/ar';

import { ArweaveWalletConnector } from '../../types';
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
  private _address?: string;
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

  async connect(): Promise<void> {
    // confirm they have the extension installed
    if (!window.arweaveWallet) {
      window.open('https://arconnect.io');
    }
    await this._wallet.connect(ARCONNECT_WALLET_PERMISSIONS, {
      name: 'ArNS - ar.io',
    });
    this._address = await this._wallet.getActiveAddress();
    return;
  }
  disconnect(): Promise<void> {
    return this._wallet.disconnect();
  }

  async getWalletAddress(): Promise<string> {
    if (!this._address) {
      await this.connect();
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this._address;
  }

  async getWalletBalanceAR(): Promise<string> {
    const winstonBalance = await this.arweave.wallets.getBalance(
      await this.getWalletAddress(),
    );
    return this._ar.winstonToAr(winstonBalance);
  }

  async getWalletANTs(approvedANTSourceCodeTxs: string[], cursor?: string) {
    const address = await this.getWalletAddress();
    const result = await this._graphql.getWalletANTs(
      approvedANTSourceCodeTxs,
      address,
      cursor,
    );
    return result;
  }
}
