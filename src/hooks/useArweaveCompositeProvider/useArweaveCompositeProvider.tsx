import Arweave from 'arweave';
import { useEffect, useState } from 'react';

import { ArweaveCompositeDataProvider } from '../../services/arweave/ArweaveCompositeDataProvider';
import { PDNSContractCache } from '../../services/arweave/PDNSContractCache';
import { SimpleArweaveDataProvider } from '../../services/arweave/SimpleArweaveDataProvider';
import { WarpDataProvider } from '../../services/arweave/WarpDataProvider';
import { useGlobalState } from '../../state/contexts/GlobalState';
import eventEmitter from '../../utils/events';

// TODO: make this an environment variable
const PDNS_SERVICE_API = 'https://dev.pdns.app';
const DEFAULT_ARWEAVE = new Arweave({
  host: 'ar-io.dev',
  protocol: 'https',
});
const defaultWarp = new WarpDataProvider(DEFAULT_ARWEAVE);
const defaultArweave = new SimpleArweaveDataProvider(DEFAULT_ARWEAVE);
const defaultContractCache = [
  new PDNSContractCache(PDNS_SERVICE_API),
  defaultWarp,
];

export function useArweaveCompositeProvider(): ArweaveCompositeDataProvider {
  const [{ gateway }] = useGlobalState();
  const [arweaveDataProvider, setArweaveDataProvider] =
    useState<ArweaveCompositeDataProvider>(
      new ArweaveCompositeDataProvider(
        defaultArweave,
        defaultWarp,
        defaultContractCache,
      ),
    );

  useEffect(() => {
    dispatchNewArweave(gateway);
  }, [gateway]);

  async function dispatchNewArweave(gateway: string): Promise<void> {
    try {
      const arweave = new Arweave({
        host: gateway,
        protocol: 'https',
      });

      const warpDataProvider = new WarpDataProvider(arweave);
      const arweaveDataProvider = new SimpleArweaveDataProvider(arweave);
      const contractCacheProviders = [
        new PDNSContractCache(PDNS_SERVICE_API),
        warpDataProvider,
      ];

      const arweaveCompositeDataProvider = new ArweaveCompositeDataProvider(
        arweaveDataProvider,
        warpDataProvider,
        contractCacheProviders,
      );
      setArweaveDataProvider(arweaveCompositeDataProvider);
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

  return arweaveDataProvider;
}
