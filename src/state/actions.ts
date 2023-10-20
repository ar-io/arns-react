import Arweave from 'arweave';
import { Dispatch } from 'react';

import { ArweaveCompositeDataProvider } from '../services/arweave/ArweaveCompositeDataProvider';
import { PDNSContractCache } from '../services/arweave/PDNSContractCache';
import { SimpleArweaveDataProvider } from '../services/arweave/SimpleArweaveDataProvider';
import { WarpDataProvider } from '../services/arweave/WarpDataProvider';
import { PDNS_SERVICE_API } from '../utils/constants';
import eventEmitter from '../utils/events';
import { GlobalAction } from './reducers';

export async function dispatchNewGateway(
  gateway: string,
  dispatch: Dispatch<GlobalAction>,
): Promise<void> {
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

    const provider = new ArweaveCompositeDataProvider(
      arweaveDataProvider,
      warpDataProvider,
      contractCacheProviders,
    );
    const blockHeight = await provider.getCurrentBlockHeight();
    dispatch({
      type: 'setBlockHeight',
      payload: blockHeight,
    });
    dispatch({
      type: 'setGateway',
      payload: {
        gateway,
        provider,
      },
    });
  } catch (error) {
    eventEmitter.emit('error', error);
  }
}
