import {
  ArweaveDataProvider,
  ArweaveTransactionID,
  PDNSContractJSON,
  PDNTContractJSON,
  SmartweaveContractCache,
  SmartweaveContractInteractionProvider,
  TransactionTag,
} from '../../types';

export class ArweaveCompositeDataProvider
  implements
    SmartweaveContractInteractionProvider,
    SmartweaveContractCache,
    ArweaveDataProvider
{
  // NOTE: this class should not have any logic for performing queries itself, but rather logic for getting results from
  // an array of providers, using different strategies such as Promise.race or Promise.all.
  private _interactionProvider: SmartweaveContractInteractionProvider;
  private _contractProviders: SmartweaveContractCache[];
  private _arweaveProvider: ArweaveDataProvider;

  // TODO: implement strategy methods
  constructor(
    arweaveProvider: ArweaveDataProvider,
    interactionProvider: SmartweaveContractInteractionProvider,
    contractProviders: SmartweaveContractCache[],
  ) {
    this._contractProviders = contractProviders;
    this._interactionProvider = interactionProvider;
    this._arweaveProvider = arweaveProvider;
  }

  async getWalletBalance(id: ArweaveTransactionID): Promise<number> {
    return this._arweaveProvider.getWalletBalance(id);
  }

  async getContractState<T extends PDNSContractJSON | PDNTContractJSON>(
    id: ArweaveTransactionID,
  ): Promise<T> {
    return Promise.any(
      this._contractProviders.map((p) => p.getContractState<T>(id)),
    );
  }

  async writeTransaction(
    id: ArweaveTransactionID,
    payload: {
      function: string;
      [x: string]: any;
    },
  ): Promise<ArweaveTransactionID | undefined> {
    return await this._interactionProvider.writeTransaction(id, payload);
  }

  async getContractBalanceForWallet(
    id: ArweaveTransactionID,
    wallet: ArweaveTransactionID,
  ): Promise<number> {
    return Promise.any(
      this._contractProviders.map((p) =>
        p.getContractBalanceForWallet(id, wallet),
      ),
    );
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

  async deployContract({
    srcCodeTransactionId,
    initialState,
    tags,
  }: {
    srcCodeTransactionId: ArweaveTransactionID;
    initialState: PDNTContractJSON;
    tags?: TransactionTag[];
  }): Promise<string> {
    return await this._interactionProvider.deployContract({
      srcCodeTransactionId,
      initialState,
      tags,
    });
  }

  async getArPrice(data: number): Promise<number> {
    return await this._arweaveProvider.getArPrice(data);
  }
}