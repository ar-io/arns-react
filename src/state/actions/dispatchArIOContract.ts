import { AoIORead, AoIOWrite } from '@ar.io/sdk/web';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { Dispatch } from 'react';

import { GlobalAction } from '../reducers';

export function dispatchArIOContract({
  contract,
  ioProcessId,
  dispatch,
}: {
  contract: AoIORead | AoIOWrite;
  ioProcessId: ArweaveTransactionID;
  dispatch: Dispatch<GlobalAction>;
}) {
  dispatch({
    type: 'setArIOContract',
    payload: contract,
  });
  dispatch({
    type: 'setioProcessId',
    payload: ioProcessId,
  });
}
