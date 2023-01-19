import {
  ANTContractState,
  ArNSContractState,
  ArweaveDataProvider,
  ArweaveTransactionId,
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

  async getWalletBalance(id: string): Promise<number> {
    return this._arweaveProvider.getWalletBalance(id);
  }

  async getContractState(
    id: string,
  ): Promise<ArNSContractState | ANTContractState | undefined> {
    return this._warpProvider.getContractState(id);
  }

  async writeTransaction(
    id: ArweaveTransactionId,
    payload: {
      [x: string]: any;
      contractTransactionId: ArweaveTransactionId;
    },
  ): Promise<ArweaveTransactionId | undefined> {
    return await this._warpProvider.writeTransaction(id, payload);
  }

  async getContractBalanceForWallet(
    id: string,
    wallet: ArweaveTransactionId,
  ): Promise<number> {
    return this._warpProvider.getContractBalanceForWallet(id, wallet);
  }

  async getContractsForWallet(
    approvedSourceCodeTransactions: string[],
    address: string,
    cursor?: string | undefined,
  ): Promise<{ ids: string[]; cursor?: string | undefined }> {
    return this._arweaveProvider.getContractsForWallet(
      approvedSourceCodeTransactions,
      address,
      cursor,
    );
  }

  async getTransactionStatus(id: ArweaveTransactionId) {
    return this._arweaveProvider.getTransactionStatus(id);
  }

  async getTransactionTags(id: string): Promise<{ [x: string]: string }> {
    return this._arweaveProvider.getTransactionTags(id);
  }

  async validateTransactionTags(params: {
    id: ArweaveTransactionId;
    numberOfConfirmations?: number;
    requiredTags?: {
      [x: string]: string[]; // allowed values
    };
  }) {
    return this._arweaveProvider.validateTransactionTags(params);
  }
}
