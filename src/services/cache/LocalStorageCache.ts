import { isArray } from 'lodash';

import { TransactionCache } from '../../types';

export class LocalStorageCache implements TransactionCache {
  constructor() {
    if (!window.localStorage) {
      throw Error('Local storage not available.');
    }
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
  set(key: string, value: any): void {
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

  del(key: string): void {
    return window.localStorage.removeItem(key);
  }
}
