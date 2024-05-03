import { isArray } from 'lodash';

import { ContractInteraction, KVCache, TransactionCache } from '../../types';
import { jsonSerialize } from '../../utils';
import { ANTContract } from '../arweave/ANTContract';
import { ArweaveTransactionID } from '../arweave/ArweaveTransactionID';

export class ContractInteractionCache implements TransactionCache, KVCache {
  private _cache: KVCache;
  constructor(cache: KVCache) {
    this._cache = cache;
  }
  async getCachedNameTokens(
    address?: ArweaveTransactionID,
  ): Promise<ANTContract[]> {
    this.clean();
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

          return new ANTContract(
            JSON.parse(deployment.payload.initState),
            new ArweaveTransactionID(contractTxId),
          );
        }
      })
      .filter((contract) => contract !== undefined);

    return cachedTokens as ANTContract[];
  }

  async getCachedInteractions(
    contractTxId: ArweaveTransactionID,
  ): Promise<ContractInteraction[]> {
    this.clean();
    const cachedInteractions = await this._cache.get(contractTxId.toString());

    return cachedInteractions.filter(
      (interaction: ContractInteraction) => interaction?.type === 'interaction',
    );
  }
  async set(key: string, value: any): Promise<void> {
    this._cache.set(key, value);
    this.clean();
  }
  async get(key: string): Promise<any> {
    this.clean();
    return this._cache.get(key);
  }
  async del(
    key: string,
    filter?: { key: string; value: string } | undefined,
  ): Promise<void> {
    this._cache.del(key, filter);
    this.clean();
  }
  async push(key: string, value: any): Promise<void> {
    this._cache.push(key, value);
    this.clean();
  }
  async clean(): Promise<void> {
    return this._cache.clean();
  }
}
