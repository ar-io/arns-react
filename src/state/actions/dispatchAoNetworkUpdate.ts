import { AoIORead, AoIOWrite } from '@ar.io/sdk';
import { Dispatch } from 'react';

import { GlobalAction } from '../reducers';

export async function dispatchAoNetworkUpdate({
  aoNetworkSettings,
  arioContract,
  dispatch,
}: {
  aoNetworkSettings: {
    CU_URL?: string;
    MU_URL?: string;
    SCHEDULER?: string;
  };
  arioContract: AoIORead | AoIOWrite;
  dispatch: Dispatch<GlobalAction>;
}) {
  dispatch({
    type: 'setAONetwork',
    payload: aoNetworkSettings,
  });
}
