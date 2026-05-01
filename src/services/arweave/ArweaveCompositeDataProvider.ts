import {
  AoARIORead,
  AoArNSNameData,
  fetchAllArNSRecords,
  mARIOToken,
} from '@ar.io/sdk/web';
import { lowerCaseDomain } from '@src/utils';

import { AoAddress, ArweaveDataProvider } from '../../types';
import { SolanaAddress } from '../solana/SolanaAddress';
import { ArweaveTransactionID } from './ArweaveTransactionID';

export class ArweaveCompositeDataProvider implements ArweaveDataProvider {
  // NOTE: this class should not have any logic for performing queries itself, but rather logic for getting results from
  // an array of providers, using different strategies such as Promise.race or Promise.all.
  private contract: AoARIORead;
  private arweave: ArweaveDataProvider;

  // TODO: implement strategy methods
  constructor({
    contract,
    arweave,
  }: {
    arweave: ArweaveDataProvider;
    contract: AoARIORead;
  }) {
    this.contract = contract;
    this.arweave = arweave;
  }

  async getArBalance(wallet: AoAddress): Promise<number> {
    return wallet instanceof ArweaveTransactionID
      ? this.arweave.getArBalance(wallet)
      : 0;
  }

  async getContractBalanceForWallet(
    wallet: ArweaveTransactionID,
  ): Promise<number> {
    return this.contract
      .getBalance({
        address: wallet.toString(),
      })
      .then((balance: number) => new mARIOToken(balance).toARIO().valueOf());
  }

  async getTransactionStatus(
    ids: ArweaveTransactionID[] | ArweaveTransactionID,
    blockheight?: number,
  ): Promise<Record<string, { confirmations: number; blockHeight: number }>> {
    return this.arweave.getTransactionStatus(ids, blockheight);
  }

  async getTransactionTags(
    id: ArweaveTransactionID,
  ): Promise<{ [x: string]: string }> {
    return this.arweave.getTransactionTags(id);
  }

  async validateTransactionTags(params: {
    id: string;
    numberOfConfirmations?: number;
    requiredTags?: {
      [x: string]: string[]; // allowed values
    };
  }) {
    return this.arweave.validateTransactionTags(params);
  }

  async validateArweaveId(id: string): Promise<ArweaveTransactionID> {
    return this.arweave.validateArweaveId(id);
  }

  async validateConfirmations(id: string): Promise<void> {
    return this.arweave.validateConfirmations(id);
  }

  async validateArweaveAddress(address: string): Promise<undefined | boolean> {
    return this.arweave.validateArweaveAddress(address);
  }

  async getArPrice(data: number): Promise<number> {
    return await this.arweave.getArPrice(data);
  }

  async getCurrentBlockHeight(): Promise<number> {
    return await this.arweave.getCurrentBlockHeight();
  }

  // TODO: implement arns service query for the following 3 functions
  async isDomainReserved({
    domain,
  }: {
    domain: string;
  }): Promise<{ isReserved: boolean; reservedFor?: string }> {
    const reserved = await this.contract.getArNSReservedName({ name: domain });
    return {
      isReserved: !!reserved,
      reservedFor: reserved?.target,
    };
  }

  async isDomainAvailable({ domain }: { domain: string }): Promise<boolean> {
    const [record, reserved] = await Promise.all([
      this.getRecord({ domain }),
      this.isDomainReserved({ domain }),
    ]);
    return !record && !reserved.isReserved;
  }

  async getRecord({
    domain,
  }: {
    domain: string;
  }): Promise<AoArNSNameData | undefined> {
    const record = await this.contract.getArNSRecord({
      name: lowerCaseDomain(domain),
    });
    return record;
  }

  async getRecords({
    filters,
  }: {
    filters: {
      // Accept either wrapper (or raw string) and match by string. ANT
      // process ids are Solana base58 post-migration, but a few callers
      // still pass `ArweaveTransactionID` for legacy AO records.
      processId?: Array<ArweaveTransactionID | SolanaAddress | string>;
    };
  }): Promise<Record<string, AoArNSNameData>> {
    // TODO: check the cache for existing records and only fetch new ones
    const records: Record<string, AoArNSNameData> = await fetchAllArNSRecords({
      contract: this.contract,
    });

    // Compare process ids by their string representation. The previous
    // `Array.includes(new ArweaveTransactionID(...))` never matched
    // (object identity) and would now also throw on Solana mints because
    // those don't pass the 43-char Arweave regex — using the string form
    // both fixes the bug and avoids the wrapper-type mismatch.
    return Object.fromEntries(
      Object.entries(records).filter(([, record]) => {
        if (filters.processId === undefined) return true;
        const target = record.processId;
        return filters.processId.some((p) => p.toString() === target);
      }),
    );
  }

  async getTokenBalance(address: AoAddress): Promise<number> {
    return this.contract
      .getBalance({
        address: address.toString(),
      })
      .then((balance) => new mARIOToken(balance).toARIO().valueOf());
  }
}
