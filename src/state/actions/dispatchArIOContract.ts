import { AoIORead, AoIOWrite } from '@ar.io/sdk/web';
import { Dispatch } from 'react';

import { GlobalAction } from '../reducers';

export function dispatchArIOContract({
  contract,
  ioProcessId,
  dispatch,
}: {
  contract: AoIORead | AoIOWrite;
  ioProcessId: string;
  dispatch: Dispatch<GlobalAction>;
}) {
  dispatch({
    type: 'setArIOContract',
    payload: contract,
  });
  dispatch({
    type: 'setIoProcessId',
    payload: ioProcessId,
  });
}
