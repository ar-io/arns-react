import {
  ArweaveDataProvider,
  ArweaveTransactionID,
  Auction,
  AuctionSettings,
  ContractInteraction,
  PDNSContractJSON,
  PDNSRecordEntry,
  PDNTContractDomainRecord,
  PDNTContractJSON,
  SmartweaveContractCache,
  SmartweaveContractInteractionProvider,
  TRANSACTION_TYPES,
  TransactionTag,
} from '../../types';
import { ARNS_REGISTRY_ADDRESS } from '../../utils/constants';

export class ArweaveCompositeDataProvider
  implements
    SmartweaveContractInteractionProvider,
    SmartweaveContractCache,
    ArweaveDataProvider
{
  // NOTE: this class should not have any logic for performing queries itself, but rather logic for getting results from
  // an array of providers, using different strategies such as Promise.race or Promise.all.
  private _interactionProvider: SmartweaveContractInteractionProvider;
  private _contractProvider: SmartweaveContractCache;
  private _arweaveProvider: ArweaveDataProvider;

  // TODO: implement strategy methods
  constructor(
    arweaveProvider: ArweaveDataProvider,
    interactionProvider: SmartweaveContractInteractionProvider,
    contractProvider: SmartweaveContractCache,
  ) {
    this._contractProvider = contractProvider;
    this._interactionProvider = interactionProvider;
    this._arweaveProvider = arweaveProvider;
  }

  async getArBalance(wallet: ArweaveTransactionID): Promise<number> {
    return this._arweaveProvider.getArBalance(wallet);
  }

  async getContractState<T extends PDNSContractJSON | PDNTContractJSON>(
    contractTxId: ArweaveTransactionID,
  ): Promise<T> {
    return this._contractProvider.getContractState<T>(contractTxId);
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
    return this._contractProvider.getContractBalanceForWallet(
      contractTxId,
      wallet,
    );
  }

  async getContractsForWallet(
    wallet: ArweaveTransactionID,
    type?: 'ant',
  ): Promise<{ contractTxIds: ArweaveTransactionID[] }> {
    return this._contractProvider.getContractsForWallet(wallet, type);
  }

  async getTransactionStatus(
    ids: ArweaveTransactionID[] | ArweaveTransactionID,
    blockheight?: number,
  ): Promise<Record<string, { confirmations: number; blockHeight: number }>> {
    return this._arweaveProvider.getTransactionStatus(ids, blockheight);
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
    auction,
    qty,
  }: {
    walletAddress: ArweaveTransactionID;
    registryId: ArweaveTransactionID;
    srcCodeTransactionId: ArweaveTransactionID;
    initialState: PDNTContractJSON;
    domain: string;
    type: TRANSACTION_TYPES;
    years?: number;
    auction: boolean;
    qty: number;
  }): Promise<string | undefined> {
    return await this._interactionProvider.registerAtomicName({
      walletAddress,
      registryId,
      srcCodeTransactionId,
      initialState,
      domain,
      type,
      years,
      auction,
      qty,
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
    return this._contractProvider.getContractInteractions(contractTxId);
  }

  async getPendingContractInteractions(
    contractTxId: ArweaveTransactionID,
    key: string,
  ): Promise<ContractInteraction[]> {
    return this._contractProvider.getPendingContractInteractions(
      contractTxId,
      key,
    );
  }
  // TODO: implement arns service query for the following 3 functions
  async isDomainReserved({
    domain,
    contractTxId,
  }: {
    domain: string;
    contractTxId?: ArweaveTransactionID;
  }): Promise<boolean> {
    return this._contractProvider.isDomainReserved({ domain, contractTxId });
  }

  async isDomainInAuction({
    contractTxId = new ArweaveTransactionID(ARNS_REGISTRY_ADDRESS),
    domain,
  }: {
    contractTxId?: ArweaveTransactionID;
    domain: string;
  }): Promise<boolean> {
    return this._contractProvider.isDomainInAuction({ contractTxId, domain });
  }

  async isDomainAvailable({
    domain,
    contractTxId,
  }: {
    domain: string;
    contractTxId?: ArweaveTransactionID;
  }): Promise<boolean> {
    return this._contractProvider.isDomainAvailable({ domain, contractTxId });
  }

  async getAuction({
    contractTxId = new ArweaveTransactionID(ARNS_REGISTRY_ADDRESS),
    domain,
    type,
  }: {
    contractTxId?: ArweaveTransactionID;
    domain: string;
    type?: 'lease' | 'permabuy';
  }): Promise<Auction> {
    return this._contractProvider.getAuction({
      contractTxId,
      domain,
      type,
    });
  }

  async getAuctionSettings({
    contractTxId,
  }: {
    contractTxId: ArweaveTransactionID;
  }): Promise<AuctionSettings> {
    return this._contractProvider.getAuctionSettings({ contractTxId });
  }

  async getDomainsInAuction({
    address,
    contractTxId,
  }: {
    address?: ArweaveTransactionID;
    contractTxId: ArweaveTransactionID;
  }): Promise<string[]> {
    return this._contractProvider.getDomainsInAuction({
      address,
      contractTxId,
    });
  }

  async getRecord({
    domain,
    contractTxId,
  }: {
    domain: string;
    contractTxId?: ArweaveTransactionID;
  }): Promise<PDNSRecordEntry> {
    return this._contractProvider.getRecord({ domain, contractTxId });
  }

  async getRecords<T extends PDNSRecordEntry | PDNTContractDomainRecord>({
    contractTxId = new ArweaveTransactionID(ARNS_REGISTRY_ADDRESS),
    filters,
    address,
  }: {
    contractTxId?: ArweaveTransactionID;
    filters: {
      contractTxId?: ArweaveTransactionID[];
    };
    address?: ArweaveTransactionID;
  }): Promise<{ [x: string]: T }> {
    return this._contractProvider.getRecords<T>({
      contractTxId,
      filters,
      address,
    });
  }

  async getIoBalance(address: ArweaveTransactionID): Promise<number> {
    return this._contractProvider.getIoBalance(address);
  }
}
