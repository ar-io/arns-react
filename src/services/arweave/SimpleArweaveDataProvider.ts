/* eslint-disable @typescript-eslint/no-unused-vars */
import Arweave from 'arweave/node';
import Ar from 'arweave/node/ar';

import {
  ArweaveDataProvider,
  ArweaveTransactionID,
  ValidationObject,
} from '../../types';
import { approvedContractsForWalletQuery } from '../../utils/constants';
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
    const confirmations = await this._arweave.api
      .get(`/tx/${id}/status`)
      .then((res: any) => {
        return res.data.number_of_confirmations;
      });
    return confirmations;
  }

  async getTransactionTags(
    id: ArweaveTransactionID,
  ): Promise<{ [x: string]: string }> {
    const { data: tags } = await this._arweave.api.get(
      `/tx/${id.toString()}/tags`,
    );
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

  async getTransactionHeaders(id: ArweaveTransactionID): Promise<any> {
    return this._arweave.api.get(`/tx/${id.toString()}`);
  }

  async validateTransactionTags({
    id,
    numberOfConfirmations = 50,
    requiredTags = {},
  }: {
    id: ArweaveTransactionID;
    numberOfConfirmations?: number;
    requiredTags?: { [x: string]: string[] };
  }): Promise<void> {
    // validate tx exists, their may be better ways to do this
    // todo: implement http code error proccesor/handler
    const { status } = await this.getTransactionHeaders(id);
    if (!status.ok) {
      throw Error(`Contract ID not found. Try again. Status: ${status}`);
    }

    // validate confirmations
    if (numberOfConfirmations && numberOfConfirmations > 0) {
      const confirmations = await this.getTransactionStatus(id);
      if (confirmations < numberOfConfirmations) {
        throw Error(
          `Contract ID does not have required number of confirmations. Current confirmations: ${confirmations}. Required number of confirmations: ${numberOfConfirmations}.`,
        );
      }
    }

    // validate tags
    if (requiredTags) {
      const tags = await this.getTransactionTags(id);
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
  async validateArweaveId(id: string): Promise<ValidationObject> {
    const validatedIdObject = { name: '', status: false, error: '' };
    validatedIdObject.name = 'Valid Arweave ID';
    try {
      new ArweaveTransactionID(id);
      validatedIdObject.status = true;
      return validatedIdObject;
    } catch (error: any) {
      validatedIdObject.status = false;
      validatedIdObject.error = error.message ? error.message : error;
      return validatedIdObject;
    }
  }
  async validateAntContractId(
    id: string,
    approvedANTSourceCodeTxs: string[],
  ): Promise<ValidationObject> {
    const validatedIdObject = { name: '', status: false, error: '' };
    validatedIdObject.name = 'Valid Arweave Name Token';
    try {
      await this.validateTransactionTags({
        id: new ArweaveTransactionID(id),
        requiredTags: {
          'Contract-Src': approvedANTSourceCodeTxs,
        },
      });
      validatedIdObject.status = true;
      return validatedIdObject;
    } catch (error: any) {
      validatedIdObject.status = false;
      validatedIdObject.error = error.message ? error.message : error;
      return validatedIdObject;
    }
  }
}
