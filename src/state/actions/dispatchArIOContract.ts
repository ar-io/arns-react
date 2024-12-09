import { AoARIORead, AoARIOWrite } from '@ar.io/sdk/web';
import { Dispatch } from 'react';

import { GlobalAction } from '../reducers';

export function dispatchArIOContract({
  contract,
  arioProcessId,
  dispatch,
}: {
  contract: AoARIORead | AoARIOWrite;
  arioProcessId: string;
  dispatch: Dispatch<GlobalAction>;
}) {
  dispatch({
    type: 'setArIOContract',
    payload: contract,
  });
  dispatch({
    type: 'setIoProcessId',
    payload: arioProcessId,
  });
}
