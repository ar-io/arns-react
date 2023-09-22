import Arweave from 'arweave';
import { useEffect, useState } from 'react';

import { ArweaveCompositeDataProvider } from '../../services/arweave/ArweaveCompositeDataProvider';
import { PDNSContractCache } from '../../services/arweave/PDNSContractCache';
import { SimpleArweaveDataProvider } from '../../services/arweave/SimpleArweaveDataProvider';
import { WarpDataProvider } from '../../services/arweave/WarpDataProvider';
import { useGlobalState } from '../../state/contexts/GlobalState';
import eventEmitter from '../../utils/events';

const PDNS_SERVICE_API =
  process.env.VITE_ARNS_SERVICE_API ?? 'https://dev.arns.app';
const ARWEAVE_HOST = process.env.VITE_ARWEAVE_HOST ?? 'ar-io.dev';

const DEFAULT_ARWEAVE = new Arweave({
  host: ARWEAVE_HOST,
  protocol: 'https',
});
const defaultWarp = new WarpDataProvider(DEFAULT_ARWEAVE);
const defaultArweave = new SimpleArweaveDataProvider(DEFAULT_ARWEAVE);
const defaultContractCache = [
  new PDNSContractCache({ url: PDNS_SERVICE_API, arweave: defaultArweave }),
];

export function useArweaveCompositeProvider(): ArweaveCompositeDataProvider {
  const [{ gateway, blockHeight: blockHeight }, dispatchGlobalState] =
    useGlobalState();
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
    arweaveDataProvider
      .getCurrentBlockHeight()
      .then((newBlockHeight: number) => {
        if (newBlockHeight === blockHeight) {
          return;
        }
        dispatchGlobalState({
          type: 'setBlockHeight',
          payload: newBlockHeight,
        });
      })
      .catch((error) => eventEmitter.emit('error', error));
  }, [gateway]);

  useEffect(() => {
    const blockInterval = setInterval(() => {
      arweaveDataProvider
        .getCurrentBlockHeight()
        .then((newBlockHieght: number) => {
          if (newBlockHieght === blockHeight) {
            return;
          }
          dispatchGlobalState({
            type: 'setBlockHeight',
            payload: newBlockHieght,
          });
        })
        .catch((error) => eventEmitter.emit('error', error));
    }, 120000); // get block height every 2 minutes or if registry or if wallet changes.

    return () => {
      clearInterval(blockInterval);
    };
  }, []);

  async function dispatchNewArweave(gateway: string): Promise<void> {
    try {
      const arweave = new Arweave({
        host: gateway,
        protocol: 'https',
      });

      const warpDataProvider = new WarpDataProvider(arweave);
      const arweaveDataProvider = new SimpleArweaveDataProvider(arweave);
      const contractCacheProviders = [
        new PDNSContractCache({
          url: PDNS_SERVICE_API,
          arweave: arweaveDataProvider,
        }),
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
