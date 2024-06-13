import { AoArNSNameData, AoIORead, mIOToken } from '@ar.io/sdk/web';

import { ArweaveDataProvider } from '../../types';
import { ArweaveTransactionID } from './ArweaveTransactionID';

export class ArweaveCompositeDataProvider implements ArweaveDataProvider {
  // NOTE: this class should not have any logic for performing queries itself, but rather logic for getting results from
  // an array of providers, using different strategies such as Promise.race or Promise.all.
  private contract: AoIORead;
  private arweave: ArweaveDataProvider;

  // TODO: implement strategy methods
  constructor({
    contract,
    arweave,
  }: {
    arweave: ArweaveDataProvider;
    contract: AoIORead;
  }) {
    this.contract = contract;
    this.arweave = arweave;
  }

  async getArBalance(wallet: ArweaveTransactionID): Promise<number> {
    return this.arweave.getArBalance(wallet);
  }

  async getContractBalanceForWallet(
    wallet: ArweaveTransactionID,
  ): Promise<number> {
    return this.contract
      .getBalance({
        address: wallet.toString(),
      })
      .then((balance) => new mIOToken(balance).toIO().valueOf());
  }

  async getContractsForWallet(): Promise<{
    processIds: ArweaveTransactionID[];
  }> {
    throw new Error('Not implemented yet');
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

  async getRecord({ domain }: { domain: string }): Promise<AoArNSNameData> {
    const record = await this.contract.getArNSRecord({ name: domain });
    if (!record) {
      throw new Error(`Couldn't get record for ${domain}`);
    }
    return record;
  }

  async getRecords({
    filters,
  }: {
    filters: {
      processId?: ArweaveTransactionID[];
    };
  }): Promise<Record<string, AoArNSNameData>> {
    const records = await this.contract.getArNSRecords();

    const filtered = Object.keys(records).reduce(
      (acc: Record<string, AoArNSNameData>, key: string) => {
        const record = records[key];
        if (filters.processId) {
          if (
            filters.processId
              .map((id) => id.toString())
              .includes(record.processId)
          ) {
            acc[key] = records[key];
          }
        }
        return acc;
      },
      {},
    );

    return filtered;
  }

  async getTokenBalance(address: ArweaveTransactionID): Promise<number> {
    return this.contract
      .getBalance({
        address: address.toString(),
      })
      .then((balance) => new mIOToken(balance).toIO().valueOf());
  }

  getPriceForInteraction(): Promise<number> {
    throw new Error('Not implemented yet');
  }
}
