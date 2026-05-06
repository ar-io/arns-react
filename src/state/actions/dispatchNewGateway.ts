import { AoARIORead, AoARIOWrite } from '@ar.io/sdk/web';
import Arweave from 'arweave';
import { Dispatch } from 'react';

import { SimpleArweaveDataProvider } from '../../services/arweave/SimpleArweaveDataProvider';
import eventEmitter from '../../utils/events';
import { GlobalAction } from '../reducers';

/**
 * Update the active Arweave gateway. Called from `NetworkSettings` when the
 * user picks a different gateway for tx-ID resolution + Turbo data uploads.
 *
 * On the Solana-only build, the AR.IO protocol contract lives on Solana and
 * is unaffected by gateway changes — this only swaps the Arweave gateway
 * used for content fetches. The `contract` arg is retained in the signature
 * so existing call sites that thread it through don't need to be updated in
 * lockstep, but it's no longer plumbed into the data provider.
 */
export async function dispatchNewGateway(
  gateway: string,
  _contract: AoARIORead | AoARIOWrite,
  dispatch: Dispatch<GlobalAction>,
): Promise<void> {
  try {
    const arweave = new Arweave({
      host: gateway,
      protocol: 'https',
    });

    const provider = new SimpleArweaveDataProvider(arweave);
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
