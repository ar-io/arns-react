/* eslint-disable @typescript-eslint/no-unused-vars */
import Arweave from 'arweave/node';
import Ar from 'arweave/node/ar';

import {
  ArweaveDataProvider,
  ArweaveTransactionID,
  TransactionHeaders,
  TransactionTag,
} from '../../types';
import { tagsToObject } from '../../utils';
import {
  RECOMMENDED_TRANSACTION_CONFIRMATIONS,
  approvedContractsForWalletQuery,
} from '../../utils/constants';

export class SimpleArweaveDataProvider implements ArweaveDataProvider {
  private _arweave: Arweave;
  private _ar: Ar = new Ar();

  constructor(arweave: Arweave) {
    this._arweave = arweave;
  }

  async getArBalance(wallet: ArweaveTransactionID): Promise<number> {
    const winstonBalance = await this._arweave.wallets.getBalance(
      wallet.toString(),
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
    const { data: encodedTags } = await this._arweave.api.get(
      `/tx/${id.toString()}/tags`,
    );
    const decodedTags = tagsToObject(JSON.parse(encodedTags));
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

  async validateConfirmations(
    id: string,
    numberOfConfirmations = RECOMMENDED_TRANSACTION_CONFIRMATIONS,
  ): Promise<void> {
    const txId = await this.validateArweaveId(id);

    // fetch the headers to confirm transaction actually exists
    await this.getTransactionHeaders(txId);

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

  async getArPrice(dataSize: number): Promise<number> {
    try {
      const result = await this._arweave.api.get(`/price/${dataSize}`);

      return +this._arweave.ar.winstonToAr(result.data, { formatted: true });
    } catch (error) {
      console.error(error);
      return 0;
    }
  }
}
