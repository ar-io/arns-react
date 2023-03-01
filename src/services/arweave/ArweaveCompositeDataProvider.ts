import { ArweaveTransactionID } from '../../types';
import {
  ANTContractJSON,
  ArNSContractState,
  ArweaveDataProvider,
  SmartweaveDataProvider,
} from '../../types';

export class ArweaveCompositeDataProvider
  implements SmartweaveDataProvider, ArweaveDataProvider
{
  // NOTE: this class should not have any logic for performing queries itself, but rather logic for getting results from
  // an array of providers, using different strategies such as Promise.race or Promise.all.
  private _warpProvider: SmartweaveDataProvider;
  private _arweaveProvider: ArweaveDataProvider;

  // TODO: implement strategy methods
  constructor(
    warpProviders: SmartweaveDataProvider,
    arweaveProviders: ArweaveDataProvider,
  ) {
    this._warpProvider = warpProviders;
    this._arweaveProvider = arweaveProviders;
  }

  async getWalletBalance(id: ArweaveTransactionID): Promise<number> {
    return this._arweaveProvider.getWalletBalance(id);
  }

  async getContractState(
    id: ArweaveTransactionID,
  ): Promise<ArNSContractState | ANTContractJSON | undefined> {
    return this._warpProvider.getContractState(id);
  }

  async writeTransaction(
    id: ArweaveTransactionID,
    payload: {
      function: string;
      [x: string]: any;
    },
  ): Promise<ArweaveTransactionID | undefined> {
    return await this._warpProvider.writeTransaction(id, payload);
  }

  async getContractBalanceForWallet(
    id: ArweaveTransactionID,
    wallet: ArweaveTransactionID,
  ): Promise<number> {
    return this._warpProvider.getContractBalanceForWallet(id, wallet);
  }

  async getContractsForWallet(
    approvedSourceCodeTransactions: ArweaveTransactionID[],
    address: ArweaveTransactionID,
    cursor?: string | undefined,
  ): Promise<{ ids: ArweaveTransactionID[]; cursor?: string | undefined }> {
    return this._arweaveProvider.getContractsForWallet(
      approvedSourceCodeTransactions,
      address,
      cursor,
    );
  }

  async getTransactionStatus(id: ArweaveTransactionID) {
    return this._arweaveProvider.getTransactionStatus(id);
  }

  async getTransactionTags(
    id: ArweaveTransactionID,
  ): Promise<{ [x: string]: string }> {
    return this._arweaveProvider.getTransactionTags(id);
  }

  async validateTransactionTags(params: {
    id: string;
    numberOfConfirmations?: number;
    requiredTags?: {
      [x: string]: string[]; // allowed values
    };
  }) {
    return this._arweaveProvider.validateTransactionTags(params);
  }

  async validateArweaveId(id: string): Promise<ArweaveTransactionID> {
    return this._arweaveProvider.validateArweaveId(id);
  }

  async validateConfirmations(id: string): Promise<void> {
    return this._arweaveProvider.validateConfirmations(id);
  }
}
