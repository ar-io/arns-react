import Arweave from 'arweave/node';
import Ar from 'arweave/node/ar';

import {
  ArweaveDataProvider,
  ArweaveTransactionID,
  TransactionHeaders,
} from '../../types';
import { tagsToObject } from '../../utils';
import {
  RECOMMENDED_TRANSACTION_CONFIRMATIONS,
  transactionByOwnerQuery,
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

  async validateArweaveAddress(address: string): Promise<undefined | boolean> {
    const targetAddress = new ArweaveTransactionID(address);

    const txPromise = this._arweave.api
      .get(`/tx/${targetAddress.toString()}`)
      .then((res: any) => (res.status === 200 ? res : false));

    const balancePromise = this._arweave.api
      .get(`/wallet/${targetAddress.toString()}/balance`)
      .then((res: any) => (res.status === 200 ? res.data > 0 : false));

    const gqlPromise = this._arweave.api
      .post(`/graphql`, transactionByOwnerQuery(targetAddress))
      .then((res: any) =>
        res.status === 200 ? res.data.data.transactions.edges : false,
      );

    const [isTransaction, balance, hasTransactions] = await Promise.all([
      txPromise,
      balancePromise,
      gqlPromise,
    ]);

    if (isTransaction) {
      const tags = tagsToObject(isTransaction.data.tags);
      const isContract = Object.values(tags).includes('SmartWeaveContract');
      if (isContract) {
        throw new Error(
          `Provided address (${targetAddress.toString()}) is a SmartWeave Contract.`,
        );
      }
      throw new Error(
        `Provided address (${targetAddress.toString()} is a transaction ID and not a Smartweave Contract or an address.`,
      );
    }

    if (!balance) {
      // test address : ceN9pWPt4IdPWj6ujt_CCuOOHGLpKu0MMrpu9a0fJNM
      // must be connected to a gateway that fetches l2 to perform this check
      if (!hasTransactions || !hasTransactions.length) {
        throw new Error(
          `Unable to verify this is an arweave address. Please double check before proceeding.`,
        );
      }
      if (hasTransactions) {
        return true;
      }
    }
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

  async getCurrentBlockHeight(): Promise<number> {
    return (await this._arweave.blocks.getCurrent()).height;
  }
}
