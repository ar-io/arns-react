import { isArray } from 'lodash';

import {
  ArweaveTransactionID,
  ContractInteraction,
  KVCache,
  TransactionCache,
} from '../../types';
import { jsonSerialize } from '../../utils';
import { PDNTContract } from '../arweave/PDNTContract';

export class ContractInteractionCache implements TransactionCache {
  _cache: KVCache;
  constructor(cache: KVCache) {
    this._cache = cache;
  }
  getCachedNameTokens(address?: ArweaveTransactionID): PDNTContract[] {
    const cachedTokens = Object.entries(window.localStorage)
      .map(([contractTxId, interactions]) => {
        const parsedInteractions = jsonSerialize(interactions) ?? interactions;

        if (isArray(parsedInteractions)) {
          const deployment = parsedInteractions.find(
            (interaction) =>
              interaction.type === 'deploy' &&
              (address ? interaction.deployer === address.toString() : true),
          );

          if (!deployment) {
            return;
          }

          return new PDNTContract(
            JSON.parse(deployment.payload.initState),
            new ArweaveTransactionID(contractTxId),
          );
        }
      })
      .filter((contract) => contract !== undefined);

    return cachedTokens as PDNTContract[];
  }

  getCachedInteractions(
    contractTxId: ArweaveTransactionID,
  ): ContractInteraction[] {
    const cachedInteractions = this._cache.get(contractTxId.toString());

    if (isArray(cachedInteractions)) {
      return cachedInteractions.filter(
        (interaction: ContractInteraction) =>
          interaction.type === 'interaction',
      );
    }
    return [];
  }

  set(key: string, value: any): void {
    this._cache.set(key, value);
  }
  get(key: string) {
    return this._cache.get(key);
  }
  del(key: string, filter?: { key: string; value: string } | undefined): void {
    this._cache.del(key, filter);
  }
  push(key: string, value: any): void {
    this._cache.push(key, value);
  }
}
