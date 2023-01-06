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
    // get all contracts deployed by an account with valid ANT source code transactions
    const address = await this.getWalletAddress();
    const deployedContractQuery = {
      query: `
      { 
        transactions (
          owners:["${address}"]
          tags:[
            {
              name:"Contract-Src",
              values:["7hL0La2KMapdJI6yIGnb4f4IjvhlGQyXnqpWc0i0d_w",
              "cNr6JPVu3rEOwIbdnu3lVipz9pwY5Pps9mxHSW7Jdtk",
              "JIIB01pRbNK2-UyNxwQK-6eknrjENMTpTvQmB8ZDzQg",
              "PEI1efYrsX08HUwvc6y-h6TSpsNlo2r6_fWL2_GdwhY"]
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
    // const transferredContractQuery = {
    // query: `
    // {
    //   transactions (
    //     tags:[
    //       {
    //         name: "App-Name",
    //         values: ["SmartWeaveAction"]
    //       },
    //       {
    //         name:"Input",
    //         values:["{\"function\":\"transfer\",\"target\":\"KsUYFIGvpX9MCbhHvsHbPAnxLIMYpzifqNFtFSuuIHA\",\"qty\":1}"]
    //       },
    //       {
    //         name:"Contract-Src",
    //         values:[${approvedSourceCodeTransactions}]
    //       }
    //     ],
    //     sort: HEIGHT_DESC,
    //   ) {
    //     pageInfo {
    //       hasNextPage
    //     }
    //     edges {
    //       cursor
    //       node {
    //         id
    //         block {
    //           height
    //         }
    //       }
    //     }
    //   }
    // }`,
    // };
    const deployedResponse = await this._arweave.api.post(
      '/graphql',
      deployedContractQuery,
    );
    console.log(deployedResponse);
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

    // const transferredResponse = await this._arweave.api.post(
    //   '/graphql',
    //   transferredContractQuery,
    // );
    // if (transferredResponse.data.data?.transactions?.edges?.length) {
    //   transferredResponse.data.data.transactions.edges
    //     .map((e: any) => ({
    //       id: tagsToObject(e.node.tags)["Contract"],
    //       cursor: e.cursor,
    //     }))
    //     .forEach((ant: { id: string; cursor: string }) => {
    //       fetchedANTids.add(ant.id);
    //       if (cursor) {
    //         newCursor = ant.cursor;
    //       }
    //     });
    // }
    return {
      ids: [...fetchedANTids],
      cursor: newCursor,
    };
  }
}
