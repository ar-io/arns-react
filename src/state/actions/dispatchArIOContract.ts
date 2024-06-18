import { AoIORead, AoIOWrite } from '@ar.io/sdk';
import { Dispatch } from 'react';

import { GlobalAction } from '../reducers';

export function dispatchArIOContract({
  contract,
  dispatch,
}: {
  contract: AoIORead | AoIOWrite;
  dispatch: Dispatch<GlobalAction>;
}) {
  dispatch({
    type: 'setArIOContract',
    payload: contract,
  });
}
