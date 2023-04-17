import axios from 'axios';

import { ArweaveTransactionID } from '../../types';
import {
  ANTContractJSON,
  ArNSContractJSON,
  SmartweaveDataProvider,
  TransactionTag,
} from '../../types';

export class LocalFileSystemDataProvider
  implements Partial<SmartweaveDataProvider>
{
  async getContractState(
    id: ArweaveTransactionID,
  ): Promise<ArNSContractJSON | ANTContractJSON | undefined> {
    const localFile = `data/contracts/${id.toString()}.json`;
    const { data } = await axios.get(localFile);
    const arnsContractState = data as any;
    return arnsContractState;
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
    tags,
  }: {
    srcCodeTransactionId: ArweaveTransactionID;
    initialState: ANTContractJSON;
    tags?: TransactionTag[];
  }): Promise<string> {
    return JSON.stringify([srcCodeTransactionId, initialState, tags]);
  }
}
