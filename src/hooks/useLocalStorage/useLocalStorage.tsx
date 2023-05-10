import { useEffect, useState } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState.js';
import { ArweaveTransactionID } from '../../types.js';

export function useLocalStorage(key: string, filterPredicate: () => boolean) {
  const [{ height, walletAddress }] = useGlobalState();
  const [cachedValue, setCachedValue] = useState<any>();
  useEffect(() => {
    updateLocalStorage(walletAddress);
  }, [height]);

  useEffect(() => {
    getCachedItem(key, filterPredicate);
  }, [key, filterPredicate]);

  async function updateLocalStorage(address?: ArweaveTransactionID) {
    if (!address?.toString()) {
      return;
    }
    const walletTxs = window.localStorage.getItem(address.toString());
    if (walletTxs) {
      console.log('there is some work to do');
    }
  }

  async function getCachedItem(key: string, filterPredicate: () => boolean) {
    const value = window.localStorage.getItem(key);
    if (!value) {
      setCachedValue(undefined);
      return;
    }
    const json = JSON.parse(value);
    const filtered = json.filter(filterPredicate);
    setCachedValue(filtered);
  }

  return {
    cachedValue,
  };
}
