import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import Arweave from 'arweave';

import { ARWEAVE_HOST } from './constants';

export function validateArweaveId(id: string): ArweaveTransactionID {
  return new ArweaveTransactionID(id);
}

export async function validateArweaveAddress(
  address: string,
  gateway: string = ARWEAVE_HOST,
): Promise<boolean> {
  const arweave = new Arweave({ host: gateway, protocol: 'https' });
  try {
    const status = await arweave.api
      .get(`/tx/${address}/status`)
      .then((res) => res.status);

    // if tx exists, this is not an address
    if (status === 200 || status === 202) {
      throw new Error('Provided string is a transaction id');
    }

    await arweave.wallets.getBalance(address);
    return true;
  } catch {
    throw new Error('Unable to verify this is an arweave address.');
  }
}
