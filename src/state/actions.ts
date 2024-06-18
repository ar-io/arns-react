import { IO, ioDevnetProcessId } from '@ar.io/sdk';
import { ArweaveWalletConnector } from '@src/types';
import Arweave from 'arweave';
import { Dispatch } from 'react';

import { ArweaveCompositeDataProvider } from '../services/arweave/ArweaveCompositeDataProvider';
import { SimpleArweaveDataProvider } from '../services/arweave/SimpleArweaveDataProvider';
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

    const arweaveDataProvider = new SimpleArweaveDataProvider(arweave);
    const contract = IO.init({
      processId: ioDevnetProcessId,
      // TOOD: allow signer to be added
    });

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
