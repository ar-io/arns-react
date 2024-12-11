import { AoARIORead, AoARIOWrite } from '@ar.io/sdk/web';
import Arweave from 'arweave';
import { Dispatch } from 'react';

import { ArweaveCompositeDataProvider } from '../../services/arweave/ArweaveCompositeDataProvider';
import { SimpleArweaveDataProvider } from '../../services/arweave/SimpleArweaveDataProvider';
import eventEmitter from '../../utils/events';
import { GlobalAction } from '../reducers';

export async function dispatchNewGateway(
  gateway: string,
  contract: AoARIORead | AoARIOWrite,
  dispatch: Dispatch<GlobalAction>,
): Promise<void> {
  try {
    const arweave = new Arweave({
      host: gateway,
      protocol: 'https',
    });

    const arweaveDataProvider = new SimpleArweaveDataProvider(arweave);
    const provider = new ArweaveCompositeDataProvider({
      arweave: arweaveDataProvider,
      contract: contract,
    });
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
