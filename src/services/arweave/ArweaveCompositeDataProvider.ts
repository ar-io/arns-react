import {
  ArweaveDataProvider,
  ArweaveTransactionID,
  Auction,
  AuctionParameters,
  AuctionSettings,
  ContractInteraction,
  PDNSContractJSON,
  PDNSRecordEntry,
  PDNTContractJSON,
  SmartweaveContractCache,
  SmartweaveContractInteractionProvider,
  TRANSACTION_TYPES,
  TransactionTag,
} from '../../types';
import { PDNTContract } from './PDNTContract';

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

  async getArBalance(wallet: ArweaveTransactionID): Promise<number> {
    return this._arweaveProvider.getArBalance(wallet);
  }

  async getContractState<T extends PDNSContractJSON | PDNTContractJSON>(
    contractTxId: ArweaveTransactionID,
    address?: ArweaveTransactionID,
  ): Promise<T> {
    return Promise.any(
      this._contractProviders.map((p) =>
        p.getContractState<T>(contractTxId, address),
      ),
    );
  }

  async writeTransaction({
    walletAddress,
    contractTxId,
    payload,
    tags,
  }: {
    walletAddress: ArweaveTransactionID;
    contractTxId: ArweaveTransactionID;
    payload: {
      function: string;
      [x: string]: any;
    };
    dryWrite?: boolean;
    tags?: TransactionTag[];
  }): Promise<ArweaveTransactionID | undefined> {
    return await this._interactionProvider.writeTransaction({
      walletAddress,
      contractTxId,
      payload,
      tags,
    });
  }

  async getContractBalanceForWallet(
    contractTxId: ArweaveTransactionID,
    wallet: ArweaveTransactionID,
  ): Promise<number> {
    return Promise.any(
      this._contractProviders.map((p) =>
        p.getContractBalanceForWallet(contractTxId, wallet),
      ),
    );
  }

  async getContractsForWallet(
    wallet: ArweaveTransactionID,
    type?: 'ant',
  ): Promise<{ contractTxIds: ArweaveTransactionID[] }> {
    return Promise.any(
      this._contractProviders.map((p) => p.getContractsForWallet(wallet, type)),
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

  async validateArweaveAddress(address: string): Promise<undefined | boolean> {
    return this._arweaveProvider.validateArweaveAddress(address);
  }

  async deployContract({
    walletAddress,
    srcCodeTransactionId,
    initialState,
    tags,
  }: {
    walletAddress: ArweaveTransactionID;
    srcCodeTransactionId: ArweaveTransactionID;
    initialState: PDNTContractJSON;
    tags?: TransactionTag[];
  }): Promise<string> {
    return await this._interactionProvider.deployContract({
      walletAddress,
      srcCodeTransactionId,
      initialState,
      tags,
    });
  }

  async registerAtomicName({
    walletAddress,
    registryId,
    srcCodeTransactionId,
    initialState,
    domain,
    type,
    years,
    reservedList,
  }: {
    walletAddress: ArweaveTransactionID;
    registryId: ArweaveTransactionID;
    srcCodeTransactionId: ArweaveTransactionID;
    initialState: PDNTContractJSON;
    domain: string;
    type: TRANSACTION_TYPES;
    years?: number;
    reservedList: string[];
  }): Promise<string | undefined> {
    return await this._interactionProvider.registerAtomicName({
      walletAddress,
      registryId,
      srcCodeTransactionId,
      initialState,
      domain,
      type,
      years,
      reservedList,
    });
  }

  async getArPrice(data: number): Promise<number> {
    return await this._arweaveProvider.getArPrice(data);
  }

  async getCurrentBlockHeight(): Promise<number> {
    return await this._arweaveProvider.getCurrentBlockHeight();
  }

  async getContractInteractions(
    contractTxId: ArweaveTransactionID,
  ): Promise<ContractInteraction[]> {
    return Promise.any(
      this._contractProviders.map((p) =>
        p.getContractInteractions(contractTxId),
      ),
    );
  }

  async getCachedNameTokens(
    address: ArweaveTransactionID,
  ): Promise<PDNTContract[]> {
    return Promise.any(
      this._contractProviders.map((p) => p.getCachedNameTokens(address)),
    );
  }

  async getPendingContractInteractions(
    contractTxId: ArweaveTransactionID,
    key: string,
  ): Promise<ContractInteraction[]> {
    return Promise.any(
      this._contractProviders.map((p) =>
        p.getPendingContractInteractions(contractTxId, key),
      ),
    );
  }
  // TODO: implement arns service query for the following 3 functions
  async isDomainReserved({ domain }: { domain: string }): Promise<boolean> {
    const res = await Promise.all(
      this._contractProviders.map((p) => p.isDomainReserved({ domain })),
    );
    return res.includes(true);
  }

  isDomainInAuction({
    domain,
    auctionsList,
  }: {
    domain: string;
    auctionsList: string[];
  }): boolean {
    return this._contractProviders.some((p) =>
      p.isDomainInAuction({ domain, auctionsList }),
    );
  }

  async isDomainAvailable({ domain }: { domain: string }): Promise<boolean> {
    const res = await Promise.all(
      this._contractProviders.map((p) => p.isDomainAvailable({ domain })),
    );
    return res.includes(true);
  }

  async getAuction(domain: string): Promise<AuctionParameters> {
    return Promise.any(
      this._contractProviders.map((p) => p.getAuction(domain)),
    );
  }

  async getAuctionSettings(id: string): Promise<AuctionSettings> {
    return Promise.any(
      this._contractProviders.map((p) => p.getAuctionSettings(id)),
    );
  }

  async getAuctionPrices(
    domain: string,
    currentBlockHeight: number,
  ): Promise<Auction> {
    return this._interactionProvider.getAuctionPrices(
      domain,
      currentBlockHeight,
    );
  }

  async getDomainsInAuction(): Promise<string[]> {
    return Promise.any(
      this._contractProviders.map((p) => p.getDomainsInAuction()),
    );
  }
  async getRecord(domain: string): Promise<PDNSRecordEntry> {
    return Promise.any(this._contractProviders.map((p) => p.getRecord(domain)));
  }
}
