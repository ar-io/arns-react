import { AoARIORead, AoARIOWrite } from '@ar.io/sdk/web';
import Arweave from 'arweave';
import { Dispatch } from 'react';

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

    const blockHeight = (await arweave.blocks.getCurrent()).height;
    dispatch({
      type: 'setBlockHeight',
      payload: blockHeight,
    });
    dispatch({
      type: 'setGateway',
      payload: {
        gateway,
      },
    });
  } catch (error) {
    eventEmitter.emit('error', error);
  }
}
