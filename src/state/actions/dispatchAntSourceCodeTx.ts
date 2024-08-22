import { DEFAULT_ARWEAVE } from '@src/utils/constants';
import Arweave from 'arweave';
import Transaction, { Tag } from 'arweave/node/lib/transaction';
import { Dispatch } from 'react';

import { ArNSAction } from '../reducers';

export async function dispatchAntSourceTx({
  id,
  arweave = DEFAULT_ARWEAVE,
  dispatch,
}: {
  id: string;
  arweave?: Arweave;
  dispatch: Dispatch<ArNSAction>;
}) {
  const sourceTx = await arweave.transactions.get(id);
  // convert b64 values to to utf-8
  const tags = sourceTx.tags.map(
    (tag) =>
      new Tag(
        tag.get('name', { decode: true, string: true }),
        tag.get('value', { decode: true, string: true }),
      ),
  );
  dispatch({
    type: 'setAntSourceTx',
    payload: {
      ...sourceTx,
      tags,
    } as Transaction,
  });
}
