import { PermissionType } from 'arconnect';
import Arweave from 'arweave';
import Ar from 'arweave/node/ar';

import { ArweaveWalletConnector } from '../../types';

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

  async getWalletANTs(
    cursor?: string,
  ): Promise<{ ids: string[]; cursor?: string }> {
    const deployedContractQuery = {
      query: `
      { 
        transactions (
          owners:["ZjmB2vEUlHlJ7-rgJkYP09N5IzLPhJyStVrK5u9dDEo"]
          tags:[
            {
              name: "App-Name",
              values: ["SmartWeaveContract"]
            }
          ]
          sort: HEIGHT_DESC
          ${cursor ? `after: ${cursor}` : ''}
        ) {
          pageInfo {
            hasNextPage
          }
          edges {
            cursor
            node {
              id
              block {
                height
              }
            }
          }
        }
      }`,
    };
    const transferedContractQuery = {
      query: `
      { 
        transactions (
          tags:[
            {
              name: "App-Name",
              values: ["SmartWeaveAction"]
            }
            {
              name:"Input",
              values:[]
            }
          ]
          sort: HEIGHT_DESC
          ${cursor ? `after: ${cursor}` : ''}
        ) {
          pageInfo {
            hasNextPage
          }
          edges {
            cursor
            node {
              id
              block {
                height
              }
            }
          }
        }
      }`,
    };
    const response = await this._arweave.api.post(
      '/graphql',
      deployedContractQuery,
    );
    const { data } = response.data;
    const fetchedANTids: Set<string> = new Set();
    let newCursor: string | undefined = undefined;
    if (data?.transactions?.edges?.length) {
      data.transactions.edges
        .map((e: any) => ({
          id: e.node.id,
          cursor: e.cursor,
        }))
        .forEach((ant: { id: string; cursor: string }) => {
          fetchedANTids.add(ant.id);
          if (cursor) {
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
