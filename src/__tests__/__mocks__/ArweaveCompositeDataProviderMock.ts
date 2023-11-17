import { ArweaveTransactionID } from '../../services/arweave/ArweaveTransactionID';
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
  TransactionTag,
} from '../../types';
import {
  ARNS_REGISTRY_ADDRESS,
  STUB_ARWEAVE_TXID,
} from '../../utils/constants';

/* eslint-disable @typescript-eslint/no-unused-vars */
export class ArweaveCompositeDataProviderMock
  implements
    SmartweaveContractInteractionProvider,
    SmartweaveContractCache,
    ArweaveDataProvider
{
  async writeTransaction({
    walletAddress,
    contractTxId,
    payload,
  }: {
    walletAddress: ArweaveTransactionID;
    contractTxId: ArweaveTransactionID;
    payload: { function: string; [x: string]: any };
    dryWrite?: boolean;
  }): Promise<ArweaveTransactionID | undefined> {
    return new ArweaveTransactionID(STUB_ARWEAVE_TXID);
  }

  async getContractBalanceForWallet(
    contractTxId: ArweaveTransactionID,
    wallet: ArweaveTransactionID,
  ): Promise<number> {
    return 50; // Mock value
  }

  async getContractsForWallet(
    wallet: ArweaveTransactionID,
    type?: 'ant',
  ): Promise<{ contractTxIds: ArweaveTransactionID[] }> {
    return { contractTxIds: [] }; // Mock value
  }

  async getTransactionStatus(
    ids: ArweaveTransactionID[] | ArweaveTransactionID,
  ): Promise<Record<string, { confirmations: number; blockHeight: number }>> {
    return { '': { confirmations: 0, blockHeight: 0 } }; // Mock value
  }

  async getTransactionTags(
    id: ArweaveTransactionID,
  ): Promise<{ [x: string]: string }> {
    return { key: 'value' }; // Mock value
  }

  async validateTransactionTags(params: {
    id: string;
    numberOfConfirmations?: number;
    requiredTags?: { [x: string]: string[] };
  }) {
    return; // Mock value
  }

  async validateArweaveId(id: string): Promise<ArweaveTransactionID> {
    return new ArweaveTransactionID(STUB_ARWEAVE_TXID); // Mock value
  }

  async validateConfirmations(id: string): Promise<void> {
    // Mock implementation
    return;
  }

  async validateArweaveAddress(address: string): Promise<undefined | boolean> {
    return true; // Mock value
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
    return 'mock-deploy-id'; // Mock value
  }

  async getContractState<T extends PDNTContractJSON | PDNSContractJSON>(
    contractTxId: ArweaveTransactionID,
  ): Promise<T> {
    return {
      records: {},
      fees: {},
    } as T; // Mock value
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
  }: {
    walletAddress: ArweaveTransactionID;
    registryId: ArweaveTransactionID;
    srcCodeTransactionId: ArweaveTransactionID;
    initialState: PDNTContractJSON;
    domain: string;
    type: TRANSACTION_TYPES;
    years?: number;
    auction: boolean;
  }): Promise<string | undefined> {
    return 'mock-register-id'; // Mock value
  }

  async getArPrice(data: number): Promise<number> {
    return 5; // Mock value
  }

  async getArBalance(wallet: ArweaveTransactionID): Promise<number> {
    return 100; // Mock value
  }

  async getCurrentBlockHeight(): Promise<number> {
    return 123456; // Mock value
  }

  async getContractInteractions(
    contractTxId: ArweaveTransactionID,
  ): Promise<ContractInteraction[]> {
    return []; // Mock value
  }

  async getPendingContractInteractions(
    contractTxId: ArweaveTransactionID,
  ): Promise<ContractInteraction[]> {
    return []; // Mock value
  }

  async isDomainReserved({ domain }: { domain: string }): Promise<boolean> {
    return false; // Mock value
  }

  async isDomainInAuction({ domain }: { domain: string }): Promise<boolean> {
    return false;
  }

  async isDomainAvailable({ domain }: { domain: string }): Promise<boolean> {
    return false;
  }

  async getAuctionPrices({ domain }: { domain: string }): Promise<Auction> {
    throw new Error('Method not implemented.');
  }
  async getAuction({
    contractTxId,
    domain,
    type,
  }: {
    contractTxId: ArweaveTransactionID;
    domain: string;
    type: 'lease' | 'permabuy';
  }): Promise<Auction> {
    throw new Error('Method not implemented.');
  }
  async getAuctionSettings({
    contractTxId,
  }: {
    contractTxId: ArweaveTransactionID;
  }): Promise<AuctionSettings> {
    throw new Error('Method not implemented.');
  }
  async getDomainsInAuction(): Promise<string[]> {
    throw new Error('Method not implemented.');
  }
  getRecord({ domain }: { domain: string }): Promise<PDNSRecordEntry> {
    return Promise.resolve({} as PDNSRecordEntry);
  }
  getRecords<T extends PDNSRecordEntry | PDNTContractDomainRecord>({
    contractTxId,
    filters,
  }: {
    contractTxId?: ArweaveTransactionID;
    filters: {
      contractTxId?: ArweaveTransactionID[];
    };
  }): Promise<{ [x: string]: T }> {
    throw new Error('Method not implemented.');
  }
  getTokenBalance(
    address: ArweaveTransactionID,
    contractTxId: ArweaveTransactionID,
  ): Promise<number> {
    throw new Error('Method not implemented.');
  }

  async getPriceForInteraction(
    interaction: INTERACTION_PRICE_PARAMS,
    contractTxId = ARNS_REGISTRY_ADDRESS,
  ): Promise<number> {
    return 0; // Mock value
  }
}
