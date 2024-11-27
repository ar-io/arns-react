import { ANT } from '@ar.io/sdk';
import { AoAddress } from '@src/types';
import eventEmitter from '@src/utils/events';
import { buildAntStateQuery } from '@src/utils/network';
import { QueryClient } from '@tanstack/react-query';
import { Dispatch } from 'react';

import { ArNSAction } from '..';

export async function dispatchANTUpdate({
  queryClient,
  processId,
  walletAddress,
  dispatch,
}: {
  queryClient: QueryClient;
  processId: string;
  walletAddress: AoAddress;
  dispatch: Dispatch<ArNSAction>;
}) {
  try {
    dispatch({
      type: 'setLoading',
      payload: true,
    });
    const antStateQuery = buildAntStateQuery({ processId });
    const state = await queryClient.fetchQuery(antStateQuery);
    const handlers = await queryClient.fetchQuery({
      queryKey: [processId, 'getHandlers'],
      queryFn: async () => {
        return await ANT.init({ processId }).getHandlers().catch(console.error);
      },
    });

    if (state) {
      dispatch({
        type: 'addAnts',
        payload: { [processId]: { state, handlers: handlers ?? [] } },
      });
    } else {
      dispatch({
        type: 'refresh',
        payload: walletAddress,
      });
    }
  } catch (error) {
    eventEmitter.emit('error', error);
  } finally {
    dispatch({
      type: 'setLoading',
      payload: false,
    });
  }
}
