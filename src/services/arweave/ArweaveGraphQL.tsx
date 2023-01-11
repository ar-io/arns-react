import Arweave from 'arweave/node/common';

import { ArweaveGraphQLAPI } from '../../types';
import { deployedAntQuery } from '../../utils/constants';

export class ArweaveGraphQL implements ArweaveGraphQLAPI {
  _arweave: Arweave;
  constructor(arweave: Arweave) {
    this._arweave = arweave;
  }
  async getWalletANTs(
    approvedSourceCodeTransactions: string[],
    address: string,
    cursor?: string,
  ): Promise<{ ids: string[]; cursor?: string }> {
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
