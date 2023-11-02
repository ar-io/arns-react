import { isArray } from 'lodash';

import { KVCache } from '../../types';
import { jsonSerialize } from '../../utils';

// time to live for transaction cache items
export const INTERACTION_CACHE_TTL_MS = 1000 * 60 * 60 * 2; // 2 HOURS

export class LocalStorageCache implements KVCache {
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

            return now - timestamp < INTERACTION_CACHE_TTL_MS;
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