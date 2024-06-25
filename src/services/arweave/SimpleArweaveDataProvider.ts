import Arweave from 'arweave/node';
import Ar from 'arweave/node/ar';
import { ResponseWithData } from 'arweave/node/lib/api';

import { ArweaveDataProvider, TransactionHeaders } from '../../types';
import { tagsToObject, withExponentialBackoff } from '../../utils';
import {
  RECOMMENDED_TRANSACTION_CONFIRMATIONS,
  transactionByOwnerQuery,
} from '../../utils/constants';
import { ArweaveTransactionID } from './ArweaveTransactionID';

const ACCEPTABLE_STATUSES = new Set([200, 202]);
export class SimpleArweaveDataProvider implements ArweaveDataProvider {
  private _arweave: Arweave;
  private _ar: Ar = new Ar();

  constructor(arweave: Arweave) {
    this._arweave = arweave;
  }

  async getArBalance(wallet: ArweaveTransactionID): Promise<number> {
    const winstonBalance = await withExponentialBackoff({
      fn: () => this._arweave.wallets.getBalance(wallet.toString()),
      shouldRetry: (balance) => !balance,
      initialDelay: 500,
      maxTries: 3,
    });
    return +this._ar.winstonToAr(winstonBalance);
  }

  async getTransactionStatus(
    ids: ArweaveTransactionID[] | ArweaveTransactionID,
    currentBlockHeight?: number,
  ): Promise<Record<string, { confirmations: number; blockHeight: number }>> {
    if (Array.isArray(ids)) {
      if (!currentBlockHeight) {
        throw new Error(
          `Current blockheight is required when fetching multiple transactions`,
        );
      }

      const queryIds = (cursor?: string) => ({
        query: ` {
        transactions(
          first:100
          ids: [${ids.map((id) => `"${id.toString()}"`)}]
          ${cursor ? `after: "${cursor}"` : ''}
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
      });

      const transactions = ids.length
        ? await this.fetchPaginatedData(queryIds)
        : ids;
      const statuses = transactions.reduce(
        (
          acc: Record<string, { confirmations: number; blockHeight: number }>,
          tx: any,
        ) => {
          // not guaranteed
          if (tx?.node?.id && tx?.node?.block?.height) {
            acc[tx.node.id] = {
              confirmations: currentBlockHeight - tx.node.block.height,
              blockHeight: tx.node.block.height,
            };
          }
          return acc;
        },
        {},
      );

      return statuses;
    }

    const { status, data } = await this._arweave.api.get(`/tx/${ids}/status`);
    if (!ACCEPTABLE_STATUSES.has(status)) {
      throw Error('Failed fetch confirmations for transaction id.');
    }
    return {
      [ids.toString()]: {
        confirmations: +data.number_of_confirmations,
        blockHeight: data.block_height,
      },
    };
  }

  async getTransactionTags(
    id: ArweaveTransactionID,
  ): Promise<{ [x: string]: string }> {
    const { data: encodedTags } = await this._arweave.api.get(
      `/tx/${id.toString()}/tags`,
    );
    const decodedTags = tagsToObject(encodedTags);
    return decodedTags;
  }

  async getTransactionHeaders(
    id: ArweaveTransactionID,
  ): Promise<TransactionHeaders> {
    const {
      status,
      data: headers,
    }: { status: number; data: TransactionHeaders } =
      await this._arweave.api.get(`/tx/${id.toString()}`);
    if (!ACCEPTABLE_STATUSES.has(status)) {
      throw Error(`Transaction ID not found. Try again. Status: ${status}`);
    }
    return headers;
  }

  async validateTransactionTags({
    id,
    requiredTags = {},
  }: {
    id: string;
    requiredTags?: { [x: string]: string[] };
  }): Promise<void> {
    const txID = await this.validateArweaveId(id);

    // fetch the headers to confirm transaction actually exists
    await this.getTransactionHeaders(txID);

    // validate tags
    if (requiredTags) {
      const tags = await this.getTransactionTags(txID);
      // check that all required tags exist, and their values are allowed
      Object.entries(requiredTags).map(([requiredTag, allowedValues]) => {
        if (Object.keys(tags).includes(requiredTag)) {
          if (allowedValues.includes(tags[requiredTag])) {
            // allowed tag!
            return true;
          }
          throw Error(
            `${requiredTag} tag is present, but as an invalid value: ${tags[requiredTag]}. Allowed values: ${allowedValues}`,
          );
        }
        throw Error(`Contract is missing required tag: ${requiredTag}`);
      });
    }
  }
  async validateArweaveId(id: string): Promise<ArweaveTransactionID> {
    // a simple promise that throws on a poorly formatted transaction id
    return new Promise((resolve, reject) => {
      try {
        const txId = new ArweaveTransactionID(id);
        resolve(txId);
      } catch (error: any) {
        reject(error);
      }
    });
  }

  async validateArweaveAddress(address: string): Promise<boolean> {
    try {
      const targetAddress = new ArweaveTransactionID(address);

      const txPromise = this._arweave.api
        .get(`/tx/${targetAddress.toString()}`)
        .then((res: ResponseWithData<TransactionHeaders>) =>
          ACCEPTABLE_STATUSES.has(res.status) ? res.data : undefined,
        );

      const balancePromise = this._arweave.api
        .get(`/wallet/${targetAddress.toString()}/balance`)
        .then((res: ResponseWithData<number>) =>
          ACCEPTABLE_STATUSES.has(res.status) ? res.data > 0 : undefined,
        );

      const gqlPromise = this._arweave.api
        .post(`/graphql`, transactionByOwnerQuery(targetAddress))
        .then((res: ResponseWithData<any>) =>
          ACCEPTABLE_STATUSES.has(res.status)
            ? res.data.data.transactions.edges
            : [],
        );

      const [isTransaction, balance, hasTransactions] = await Promise.all([
        txPromise,
        balancePromise,
        gqlPromise,
      ]);

      if (hasTransactions.length || balance) {
        return true;
      }

      if (isTransaction) {
        const tags = tagsToObject(isTransaction.tags);

        const isContract = Object.values(tags).includes('SmartWeaveContract');

        throw new Error(
          `Provided address (${targetAddress.toString()} is a ${
            isContract ? 'Smartweave Contract' : 'transaction ID'
          }.`,
        );
      }
      // test address : ceN9pWPt4IdPWj6ujt_CCuOOHGLpKu0MMrpu9a0fJNM
      // must be connected to a gateway that fetches L2 to perform this check
      if (!hasTransactions || !hasTransactions.length) {
        throw new Error(`Address has no transactions`);
      }
      return true;
    } catch (error) {
      throw new Error(`Unable to verify this is an arweave address.`);
    }
  }

  async validateConfirmations(
    id: string,
    requiredNumberOfConfirmations = RECOMMENDED_TRANSACTION_CONFIRMATIONS,
  ): Promise<void> {
    const txId = await this.validateArweaveId(id);

    // fetch the headers to confirm transaction actually exists
    await this.getTransactionHeaders(txId);

    // validate confirmations
    if (requiredNumberOfConfirmations > 0) {
      const confirmations = await this.getTransactionStatus(txId);
      if (
        confirmations[txId.toString()].confirmations <
        requiredNumberOfConfirmations
      ) {
        throw Error(
          `Process ID does not have required number of confirmations. Current confirmations: ${confirmations}. Required number of confirmations: ${requiredNumberOfConfirmations}.`,
        );
      }
    }
  }

  async getArPrice(dataSize: number): Promise<number> {
    try {
      const result = await this._arweave.api.get(`/price/${dataSize}`);

      return +this._arweave.ar.winstonToAr(result.data, { formatted: true });
    } catch (error) {
      console.error(error);
      return 0;
    }
  }

  async getCurrentBlockHeight(): Promise<number> {
    return (await this._arweave.blocks.getCurrent()).height;
  }

  async fetchPaginatedData(query: (c?: string) => Record<string, any>) {
    let hasNextPage = true;
    let afterCursor: string | undefined = undefined;
    let allData: any[] = [];

    while (hasNextPage) {
      try {
        const response = await withExponentialBackoff({
          fn: () =>
            this._arweave.api.post(
              '/graphql',
              query(afterCursor),
            ) as Promise<ResponseWithData>,
          shouldRetry: (error) => error?.status === 429,
          initialDelay: 100,
          maxTries: 30,
        });
        const transactions = response?.data?.data?.transactions;

        if (transactions?.edges.length) {
          allData = [...allData, ...transactions.edges];
        }
        hasNextPage = transactions?.pageInfo?.hasNextPage;
        afterCursor = transactions?.edges?.at(-1)?.cursor;
        if (!afterCursor) {
          hasNextPage = false;
        }
      } catch (error) {
        console.error('Error fetching paginated data:', error);
        hasNextPage = false;
      }
    }

    return allData;
  }
}
