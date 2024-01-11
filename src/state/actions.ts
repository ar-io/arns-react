import ArweaveServiceController from '@src/services/ArweaveServiceController';
import { ArweaveWalletConnector } from '@src/types';
import Arweave from 'arweave';
import { Dispatch } from 'react';

import { ARNSContractCache } from '../services/arweave/ARNSContractCache';
import { ArweaveCompositeDataProvider } from '../services/arweave/ArweaveCompositeDataProvider';
import { SimpleArweaveDataProvider } from '../services/arweave/SimpleArweaveDataProvider';
import { WarpDataProvider } from '../services/arweave/WarpDataProvider';
import { ARNS_SERVICE_API } from '../utils/constants';
import eventEmitter from '../utils/events';
import { GlobalAction } from './reducers';

export async function dispatchNewGateway(
  gateway: string,
  walletConnector: ArweaveWalletConnector,
  dispatch: Dispatch<GlobalAction>,
): Promise<void> {
  try {
    const arweave = new Arweave({
      host: gateway,
      protocol: 'https',
    });

    const warpDataProvider = new WarpDataProvider(arweave, walletConnector);
    const arweaveDataProvider = new SimpleArweaveDataProvider(arweave);
    const contractCacheProviders = new ARNSContractCache({
      url: ARNS_SERVICE_API,
      arweave: arweaveDataProvider,
    });

    const provider = new ArweaveServiceController(
      new ArweaveCompositeDataProvider(
        arweaveDataProvider,
        warpDataProvider,
        contractCacheProviders,
      ),
    ) as any as ArweaveCompositeDataProvider;
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
