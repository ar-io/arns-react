/* eslint-disable @typescript-eslint/no-unused-vars */
import Arweave from 'arweave/node';
import Ar from 'arweave/node/ar';

import {
  ArweaveDataProvider,
  ArweaveTransactionID,
  TransactionHeaders,
  TransactionTag,
} from '../../types';
import {
  RECOMMENDED_TRANSACTION_CONFIRMATIONS,
  approvedContractsForWalletQuery,
} from '../../utils/constants';
import { tagsToObject } from '../../utils/searchUtils';

export class SimpleArweaveDataProvider implements ArweaveDataProvider {
  private _arweave: Arweave;
  private _ar: Ar = new Ar();

  constructor(arweave: Arweave) {
    this._arweave = arweave;
  }

  async getWalletBalance(id: ArweaveTransactionID): Promise<number> {
    const winstonBalance = await this._arweave.wallets.getBalance(
      id.toString(),
    );
    return +this._ar.winstonToAr(winstonBalance);
  }

  async getTransactionStatus(id: ArweaveTransactionID) {
    const { status, data } = await this._arweave.api.get(`/tx/${id}/status`);
    if (status !== 200) {
      throw Error('Failed fetch confirmations for transaction id.');
    }
    return +data.number_of_confirmations;
  }

  async getTransactionTags(
    id: ArweaveTransactionID,
  ): Promise<{ [x: string]: string }> {
    const { data: tags }: { data: TransactionTag[] } =
      await this._arweave.api.get(`/tx/${id.toString()}/tags`);
    const decodedTags = tagsToObject(tags);
    return decodedTags;
  }

  async getContractsForWallet(
    approvedSourceCodeTransactions: ArweaveTransactionID[],
    address: ArweaveTransactionID,
    cursor: string | undefined,
  ): Promise<{
    ids: ArweaveTransactionID[];
    isLastPage: boolean;
    cursor?: string;
  }> {
    const fetchedANTids: Set<ArweaveTransactionID> = new Set();
    let newCursor: string | undefined = undefined;
    let isLastPage = false;

    // get contracts deployed by user, filtering with src-codes to only get ANT contracts

    const deployedResponse = await this._arweave.api.post(
      '/graphql',
      approvedContractsForWalletQuery(
        address,
        approvedSourceCodeTransactions,
        cursor,
      ),
    );
    if (deployedResponse.data.data?.transactions?.edges?.length) {
      deployedResponse.data.data.transactions.edges
        .map((e: any) => ({
          id: new ArweaveTransactionID(e.node.id),
          cursor: e.cursor,
          isLastPage: !e.pageInfo?.hasNextPage,
        }))
        .forEach(
          (ant: {
            id: ArweaveTransactionID;
            cursor: string;
            isLastPage: boolean;
          }) => {
            fetchedANTids.add(ant.id);
            if (ant.cursor) {
              newCursor = ant.cursor;
            }
            if (ant.isLastPage) {
              isLastPage = ant.isLastPage;
            }
          },
        );
    }
    return {
      ids: [...fetchedANTids],
      cursor: newCursor,
      isLastPage: isLastPage,
    };
  }

  async getTransactionHeaders(
    id: ArweaveTransactionID,
  ): Promise<TransactionHeaders> {
    const { status, data: headers } = await this._arweave.api.get(
      `/tx/${id.toString()}`,
    );
    if (status !== 200) {
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
    // validate tx exists, their may be better ways to do this
    const txID = await this.validateArweaveId(id);
    const tags = await this.getTransactionHeaders(txID);

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
    return new Promise((resolve, reject) => {
      try {
        const txId = new ArweaveTransactionID(id);
        resolve(txId);
      } catch (error: any) {
        reject(error);
      }
    });
  }

  async validateConfirmations(
    id: string,
    numberOfConfirmations = RECOMMENDED_TRANSACTION_CONFIRMATIONS,
  ): Promise<void> {
    const txId = await this.validateArweaveId(id);
    // validate confirmations
    if (numberOfConfirmations > 0) {
      const confirmations = await this.getTransactionStatus(txId);
      if (confirmations < numberOfConfirmations) {
        throw Error(
          `Contract ID does not have required number of confirmations. Current confirmations: ${confirmations}. Required number of confirmations: ${numberOfConfirmations}.`,
        );
      }
    }
  }
}
