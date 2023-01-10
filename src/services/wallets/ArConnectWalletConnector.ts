import { PermissionType } from 'arconnect';
import Arweave from 'arweave';
import Ar from 'arweave/node/ar';

import { ArweaveWalletConnector } from '../../types';
import { deployedAntQuery } from '../../utils/constants';

const ARCONNECT_WALLET_PERMISSIONS: PermissionType[] = [
  'ACCESS_ADDRESS',
  'ACCESS_ALL_ADDRESSES',
  'ACCESS_PUBLIC_KEY',
  'SIGN_TRANSACTION',
];

export class ArConnectWalletConnector implements ArweaveWalletConnector {
  private _wallet: Window['arweaveWallet'];
  private _arweave: Arweave;
  private _ar: Ar = new Ar();
  private _address?: string;

  constructor(arweave: Arweave) {
    this._wallet = window.arweaveWallet;
    this._arweave = arweave;
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
    const winstonBalance = await this._arweave.wallets.getBalance(
      await this.getWalletAddress(),
    );
    return this._ar.winstonToAr(winstonBalance);
  }

  async getWalletANTs(
    approvedSourceCodeTransactions: string[],
    cursor?: string,
  ): Promise<{ ids: string[]; cursor?: string }> {
    const address = await this.getWalletAddress();
    const fetchedANTids: Set<string> = new Set();
    let newCursor: string | undefined = undefined;

    // get contracts deployed by user, filtering with src-codes to only get ANT contracts
    const deployedResponse = await this._arweave.api.post(
      '/graphql',
      deployedAntQuery(address, approvedSourceCodeTransactions, cursor),
    );
    if (deployedResponse.data.data?.transactions?.edges?.length) {
      deployedResponse.data.data.transactions.edges
        .map((e: any) => ({
          id: e.node.id,
          cursor: e.cursor,
        }))
        .forEach((ant: { id: string; cursor: string }) => {
          fetchedANTids.add(ant.id);
          if (ant.cursor) {
            newCursor = ant.cursor;
          }
        });
    }
    return {
      ids: [...fetchedANTids],
      cursor: newCursor,
    };
  }
}
