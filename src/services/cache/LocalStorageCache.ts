import { isArray } from 'lodash';

import {
  ArweaveTransactionID,
  ContractInteraction,
  TransactionCache,
} from '../../types';
import { jsonSerialize } from '../../utils';
import { PDNTContract } from '../arweave/PDNTContract';

// time to live for transaction cache items
export const ITEM_TTL = 1000 * 60 * 60 * 2; // 2 HOURS

export class LocalStorageCache implements TransactionCache {
  constructor() {
    if (!window.localStorage) {
      throw Error('Local storage not available.');
    }
    this.clean();
  }

  get(key: string): string | object | any[] {
    const cachedItem = window.localStorage.getItem(key) ?? '[]';
    try {
      return JSON.parse(cachedItem);
    } catch (error) {
      console.debug(`Failed to get item from cache. ${key}`);
      return [];
    }
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
    const cachedInteractions = this.get(contractTxId.toString());

    if (isArray(cachedInteractions)) {
      return cachedInteractions.filter(
        (interaction: ContractInteraction) =>
          interaction.type === 'interaction',
      );
    }
    return [];
  }

  // default to use arrays for now, and just push items to a given key
  push(key: string, value: any): void {
    const currentCache = this.get(key);
    if (isArray(currentCache)) {
      const updatedArr = [
        {
          ...value,
          timestamp: Date.now(),
        },
        ...currentCache,
      ];
      return window.localStorage.setItem(key, JSON.stringify(updatedArr));
    }
    return window.localStorage.setItem(key, JSON.stringify(value));
  }

  del(key: string, filter?: { key: string; value: string }): void {
    const currentCache = this.get(key);
    if (isArray(currentCache)) {
      if (!filter) {
        // no filter set so clear
        return window.localStorage.removeItem(key);
      }
      const { key: filterKey, value: matchFilterValue } = filter;
      const updatedArr = currentCache.filter((cachedValue: any) => {
        // add check if it's a json object and parsed correctly
        return cachedValue[filterKey] !== matchFilterValue;
      });
      window.localStorage.setItem(key, JSON.stringify(updatedArr));
    }
    // existing delete functionality
    return window.localStorage.removeItem(key);
  }

  set(key: string, value: any) {
    return window.localStorage.setItem(key, JSON.stringify(value));
  }

  clean() {
    const items = Object.entries(window.localStorage);
    for (const [key, values] of items) {
      try {
        const parsedValues = jsonSerialize(values) ?? values;
        if (isArray(parsedValues)) {
          const now = Date.now();
          const filteredValues = parsedValues.filter((value: any) => {
            const { timestamp } = value;
            if (!timestamp) {
              return false;
            }

            return now - timestamp < ITEM_TTL;
          });
          if (filteredValues.length > 0) {
            this.set(key, filteredValues);
          } else {
            this.del(key);
          }
        }
        if (!parsedValues || !parsedValues.length) {
          this.del(key);
        }
      } catch (error) {
        console.debug(`Failed to clean item from cache. ${key}`);
      }
    }
  }
}
