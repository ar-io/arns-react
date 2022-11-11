import axios from 'axios';

import {
  ArNSContractState,
  ArweaveTransactionId,
  SmartweaveContractSource,
} from '../../types';

export class LocalFileSystemDataProvider implements SmartweaveContractSource {
  async getContractState(
    contractId: ArweaveTransactionId,
  ): Promise<ArNSContractState | undefined> {
    try {
      const localFile = `data/contracts/${contractId}.json`;
      const { data } = await axios.get(localFile);
      const arnsContractState = data as ArNSContractState;
      return arnsContractState;
    } catch (err) {
      console.error('Unable to load contract state.');
    }
    return;
  }
}
