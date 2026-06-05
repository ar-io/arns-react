import {
  ARIORead,
  ArNSNameData,
  ArNSNameDataWithName,
  mARIOToken,
} from '@ar.io/sdk/web';
import { lowerCaseDomain } from '@src/utils';

import { AoAddress, ArweaveDataProvider } from '../../types';
import { SolanaAddress } from '../solana/SolanaAddress';
import { ArweaveTransactionID } from './ArweaveTransactionID';

export class ArweaveCompositeDataProvider implements ArweaveDataProvider {
  // NOTE: this class should not have any logic for performing queries itself, but rather logic for getting results from
  // an array of providers, using different strategies such as Promise.race or Promise.all.
  private contract: ARIORead;
  private arweave: ArweaveDataProvider;

  // TODO: implement strategy methods
  constructor({
    contract,
    arweave,
  }: {
    arweave: ArweaveDataProvider;
    contract: ARIORead;
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
  }): Promise<ArNSNameData | undefined> {
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
  }): Promise<Record<string, ArNSNameData>> {
    // Push the processId filter down to the RPC instead of paginating the
    // ENTIRE registry and filtering client-side. On Solana the SDK turns a
    // `processId` filter into a selective per-mint `getProgramAccounts`, so
    // a scoped lookup costs a handful of selective reads rather than
    // ceil(registrySize / 1000) full-registry scans.
    const processId = filters.processId?.map((p) => p.toString());
    const scoped = processId !== undefined && processId.length > 0;

    const records: Record<string, ArNSNameData> = {};
    let cursor: string | undefined = undefined;
    let hasMore = true;
    while (hasMore) {
      const page = await this.contract.getArNSRecords({
        limit: 1000,
        cursor,
        ...(scoped ? { filters: { processId } } : {}),
      });
      for (const item of page.items) {
        records[(item as ArNSNameDataWithName).name] = item;
      }
      cursor = page.nextCursor;
      hasMore = page.hasMore;
    }

    // The RPC already applied the processId filter when one was supplied, so
    // no client-side re-filter is needed.
    return records;
  }

  async getTokenBalance(address: AoAddress): Promise<number> {
    return this.contract
      .getBalance({
        address: address.toString(),
      })
      .then((balance) => new mARIOToken(balance).toARIO().valueOf());
  }
}
