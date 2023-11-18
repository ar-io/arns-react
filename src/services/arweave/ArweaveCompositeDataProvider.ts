import { Tags } from 'warp-contracts';

import {
  ArweaveDataProvider,
  Auction,
  AuctionSettings,
  ContractInteraction,
  INTERACTION_PRICE_PARAMS,
  PDNSContractJSON,
  PDNSRecordEntry,
  PDNTContractDomainRecord,
  PDNTContractJSON,
  SmartweaveContractCache,
  SmartweaveContractInteractionProvider,
  TRANSACTION_TYPES,
} from '../../types';
import { byteSize, userHasSufficientBalance } from '../../utils';
import { ARNS_REGISTRY_ADDRESS } from '../../utils/constants';
import { ArweaveTransactionID } from './ArweaveTransactionID';
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
    interactionDetails,
  }: {
    walletAddress: ArweaveTransactionID;
    contractTxId: ArweaveTransactionID;
    payload: {
      function: string;
      [x: string]: any;
    };
    dryWrite?: boolean;
    tags?: Tags;
    interactionDetails?: Record<string, any>;
  }): Promise<ArweaveTransactionID | undefined> {
    const payloadSize = byteSize(JSON.stringify(payload));
    const arBalance = await this._arweaveProvider.getArBalance(walletAddress);
    const txPrice = await this._arweaveProvider.getArPrice(payloadSize);

    if (!arBalance || arBalance < txPrice) {
      throw new Error('Insufficient AR balance to perform transaction');
    }

    if (contractTxId === ARNS_REGISTRY_ADDRESS) {
      const ioBalance = await this._contractProvider.getTokenBalance(
        walletAddress,
        ARNS_REGISTRY_ADDRESS,
      );
      if (
        !userHasSufficientBalance({
          balances: { io: +ioBalance },
          costs: { io: +payload.qty },
        })
      ) {
        throw new Error('Insufficient IO balance to perform transaction');
      }
    }

    return await this._interactionProvider.writeTransaction({
      walletAddress,
      contractTxId,
      payload,
      tags,
      interactionDetails,
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
    tags?: Tags;
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
    isBid,
  }: {
    walletAddress: ArweaveTransactionID;
    registryId: ArweaveTransactionID;
    srcCodeTransactionId: ArweaveTransactionID;
    initialState: PDNTContractJSON;
    domain: string;
    type: TRANSACTION_TYPES;
    years?: number;
    auction: boolean;
    qty?: number;
    isBid: boolean;
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
      isBid,
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
  ): Promise<ContractInteraction[]> {
    return this._contractProvider.getPendingContractInteractions(contractTxId);
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
    contractTxId = ARNS_REGISTRY_ADDRESS,
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
    contractTxId = ARNS_REGISTRY_ADDRESS,
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
    contractTxId = ARNS_REGISTRY_ADDRESS,
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

  async getTokenBalance(
    address: ArweaveTransactionID,
    contractTxId: ArweaveTransactionID,
  ): Promise<number> {
    return this._contractProvider.getTokenBalance(address, contractTxId);
  }
  async getBlock(height: number): Promise<Record<string, any>> {
    return this._arweaveProvider.getBlock(height);
  }
  async warmTickStateCache({
    progressCallback,
  }: {
    progressCallback?: (current: number, total: number) => void;
  }): Promise<void> {
    return this._contractProvider.warmTickStateCache({ progressCallback });
  }

  getPriceForInteraction(
    interaction: INTERACTION_PRICE_PARAMS,
    contractTxId = ARNS_REGISTRY_ADDRESS,
  ): Promise<number> {
    return this._contractProvider.getPriceForInteraction(
      interaction,
      contractTxId,
    );
  }
  async buildANTContract(
    contractTxId: ArweaveTransactionID,
  ): Promise<PDNTContract> {
    return this._contractProvider.buildANTContract(contractTxId);
  }
}
