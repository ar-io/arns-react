import Arweave from 'arweave';
import { Dispatch } from 'react';

import { ARNSContractCache } from '../services/arweave/ARNSContractCache';
import { ArweaveCompositeDataProvider } from '../services/arweave/ArweaveCompositeDataProvider';
import { SimpleArweaveDataProvider } from '../services/arweave/SimpleArweaveDataProvider';
import { WarpDataProvider } from '../services/arweave/WarpDataProvider';
import { ARNS_SERVICE_API } from '../utils/constants';
import eventEmitter from '../utils/events';
import { GlobalAction } from './reducers';

// TODO: use provided gateway once warp implements deduplication of interactions retrieved from gql
export async function dispatchNewGateway(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  gateway: string,
  dispatch: Dispatch<GlobalAction>,
): Promise<void> {
  try {
    const arweave = new Arweave({
      //host: gateway,
      host: 'ar-io.dev',
      protocol: 'https',
    });

    const warpDataProvider = new WarpDataProvider(arweave);
    const arweaveDataProvider = new SimpleArweaveDataProvider(arweave);
    const contractCacheProviders = new ARNSContractCache({
      url: ARNS_SERVICE_API,
      arweave: arweaveDataProvider,
    });

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
        gateway: 'ar-io.dev',
        provider,
      },
    });
  } catch (error) {
    eventEmitter.emit('error', error);
  }
}
