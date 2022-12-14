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
  async writeTransaction(
    payload: any,
  ): Promise<ArweaveTransactionId | undefined> {
    const stub = JSON.stringify(payload);
    return stub;
  }
  async getContractBalanceForWallet(
    contractId: ArweaveTransactionId,
    wallet: ArweaveTransactionId,
  ) {
    const state = await this.getContractState(contractId);
    return state?.balances[wallet] ?? 0;
  }
}
