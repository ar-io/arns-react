import { ArIOReadable, ArIOWritable } from '@ar.io/sdk';
import { Dispatch } from 'react';

import { GlobalAction } from '../reducers';

export function dispatchArIOContract({
  provider,
  dispatch,
}: {
  provider: ArIOWritable | ArIOReadable;
  dispatch: Dispatch<GlobalAction>;
}) {
  dispatch({
    type: 'setArIOContract',
    payload: provider,
  });
}
