import { PermissionType } from 'arconnect';
import Arweave from 'arweave';
import Ar from 'arweave/node/ar';

import { ArweaveWalletConnector } from '../../types';
import { tagsToObject } from '../../utils/searchUtils';
import { arweave } from '../arweave/arweave';

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
  address: string;

  constructor(arweave: Arweave) {
    this._wallet = window.arweaveWallet;
    this._arweave = arweave;
    this.address = '';
    this._wallet.getActiveAddress().then((address) => (this.address = address));
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
    approvedSourceCodeTransactions: string[],
    cursor?: string,
  ): Promise<{ ids: string[]; cursor?: string }> {
    // get all contracts deployed by an account with valid ANT source code transactions
    const deployedContractQuery = {
      query: `
      { 
        transactions (
          owners:["${this.address}"]
          tags:[
            {
              name:"Contract-Src",
              values:${JSON.stringify(approvedSourceCodeTransactions)}
            }
          ],
          sort: HEIGHT_DESC,
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
    // get all contracts transfered to an account
    const transferredContractQuery = {
      query: `
    {
      transactions (
        tags:[
          {
            name:"Input",
            values:[${JSON.stringify(
              JSON.stringify({
                function: 'transfer',
                target: this.address,
                qty: 1,
              }),
            )}]
          }
        ],
        sort: HEIGHT_DESC,
      ) {
        pageInfo {
          hasNextPage
        }
        edges {
          cursor
          node {
            id
            tags{
              name
              value
            }
            block {
              height
            }
          }
        }
      }
    }`,
    };
    const deployedResponse = await this._arweave.api.post(
      '/graphql',
      deployedContractQuery,
    );
    const { data } = deployedResponse.data;
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

    const transferredResponse = await this._arweave.api.post(
      '/graphql',
      transferredContractQuery,
    );
    console.log(transferredResponse.data.data.transactions.edges);
    if (transferredResponse.data.data?.transactions?.edges?.length) {
      transferredResponse.data.data.transactions.edges
        .map((e: any) => {
          const tags = tagsToObject({ tags: e.node.tags });
          return { id: tags['Contract'], cursor: e.cursor };
        })
        .forEach((ant: { id: string; cursor: string; srcCode: string }) => {
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
