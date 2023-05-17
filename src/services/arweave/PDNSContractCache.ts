import { isArray } from 'lodash';

import {
  ArweaveTransactionID,
  ContractInteraction,
  PDNSContractJSON,
  PDNTContractJSON,
  SmartweaveContractCache,
  TransactionCache,
} from '../../types';
import { LocalStorageCache } from '../cache/LocalStorageCache';

export class PDNSContractCache implements SmartweaveContractCache {
  private _url: string;
  private _cache: TransactionCache;

  constructor(url: string, cache: TransactionCache = new LocalStorageCache()) {
    this._url = url;
    this._cache = cache;
  }

  async getContractState<T extends PDNTContractJSON | PDNSContractJSON>(
    contractTxId: ArweaveTransactionID,
  ): Promise<T> {
    const res = await fetch(`${this._url}/contract/${contractTxId.toString()}`);
    const { state } = await res.json();
    return state as T;
  }

  async getContractBalanceForWallet(
    contractTxId: ArweaveTransactionID,
    wallet: ArweaveTransactionID,
  ): Promise<number> {
    const res = await fetch(
      `${
        this._url
      }/contract/${contractTxId.toString()}/balances/${wallet.toString()}`,
    );
    const { balance } = await res.json();
    return +balance ?? 0;
  }

  async getContractsForWallet(
    address: ArweaveTransactionID,
  ): Promise<{ ids: ArweaveTransactionID[] }> {
    const res = await fetch(
      `${this._url}/wallet/${address.toString()}/contracts`,
    );
    const { contractIds } = await res.json();
    return {
      ids: contractIds.map((id: string) => new ArweaveTransactionID(id)),
    };
  }

  async getContractInteractions(
    contractTxId: ArweaveTransactionID,
  ): Promise<ContractInteraction[]> {
    const res = await fetch(
      `${this._url}/contract/${contractTxId.toString()}/interactions`,
    );
    const { interactions } = await res.json();
    return interactions;
  }

  async getPendingContractInteractions(
    id: ArweaveTransactionID,
    key: string,
  ): Promise<ContractInteraction[]> {
    const cachedContractInteractions = this._cache.get(key);

    if (
      !isArray(cachedContractInteractions) ||
      !cachedContractInteractions.length
    ) {
      return [];
    }

    const gqlIndexedInteractions = await this.getContractInteractions(id);
    const pendingInteractions = cachedContractInteractions.filter(
      (i) =>
        !gqlIndexedInteractions.find(
          (gqlInteraction: ContractInteraction) => gqlInteraction.id === i.id,
        ),
    );
    return pendingInteractions;
  }
}
