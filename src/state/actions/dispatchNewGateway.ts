import { IO } from '@ar.io/sdk/web';
import { ArweaveWalletConnector } from '@src/types';
import { IO_PROCESS_ID } from '@src/utils/constants';
import Arweave from 'arweave';
import { Dispatch } from 'react';

import { ArweaveCompositeDataProvider } from '../../services/arweave/ArweaveCompositeDataProvider';
import { SimpleArweaveDataProvider } from '../../services/arweave/SimpleArweaveDataProvider';
import eventEmitter from '../../utils/events';
import { GlobalAction } from '../reducers';

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
      processId: IO_PROCESS_ID,
      signer: walletConnector.arconnectSigner,
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
