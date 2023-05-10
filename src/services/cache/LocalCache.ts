import { TransactionCache } from '../../types.js';

export class LocalStorageCache implements TransactionCache {
  constructor() {
    if (!window.localStorage) {
      throw Error('Local storage not available.');
    }
  }
  get(key: string): any {
    return window.localStorage.getItem(key);
  }

  set(key: string, payload: any): void {
    const string = this.get(key) ?? '[]';
    const current: any[] = JSON.parse(string);
    return window.localStorage.setItem(key, JSON.stringify([payload, current]));
  }

  del(key: string): void {
    return window.localStorage.removeItem(key);
  }
}
