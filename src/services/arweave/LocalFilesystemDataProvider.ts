import axios from 'axios';

import { ArweaveTransactionID } from '../../types';
import {
  ANTContractState,
  ArNSContractState,
  SmartweaveDataProvider,
  TransactionTag,
} from '../../types';

export class LocalFileSystemDataProvider implements SmartweaveDataProvider {
  async getContractState(
    id: ArweaveTransactionID,
  ): Promise<ArNSContractState | undefined> {
    try {
      const localFile = `data/contracts/${id.toString()}.json`;
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
  ): Promise<ArweaveTransactionID | undefined> {
    const stub = JSON.stringify(payload);
    return new ArweaveTransactionID(stub);
  }
  async getContractBalanceForWallet(
    id: ArweaveTransactionID,
    wallet: ArweaveTransactionID,
  ) {
    const state = await this.getContractState(id);
    return state?.balances[wallet.toString()] ?? 0;
  }
  async getContractConfirmations(id: ArweaveTransactionID) {
    const exists = this.getContractState(id);
    if (!exists) {
      return 0;
    }
    return 50;
  }
  async deployContract({
    srcCodeTransactionId,
    initialState,
    stateType,
    tags,
  }: {
    srcCodeTransactionId: ArweaveTransactionID;
    initialState: ArweaveTransactionID | ANTContractState;
    stateType: 'TXID' | 'TAG' | 'DATA';
    tags: TransactionTag[];
  }): Promise<string | undefined> {
    return JSON.stringify([
      srcCodeTransactionId,
      initialState,
      stateType,
      tags,
    ]);
  }
}
