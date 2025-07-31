import { Dispatch } from 'react';

import eventEmitter from '../../utils/events';
import { GlobalAction } from '../reducers';

export async function dispatchNewGateway(
  gateway: string,
  dispatch: Dispatch<GlobalAction>,
): Promise<void> {
  try {
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
