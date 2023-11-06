import axios from 'axios';

import {
  PDNSContractJSON,
  PDNTContractJSON,
  SmartweaveContractInteractionProvider,
  TransactionTag,
} from '../../types';
import { ArweaveTransactionID } from './ArweaveTransactionID';

export class LocalFileSystemDataProvider
  implements Partial<SmartweaveContractInteractionProvider>
{
  async getContractState<T extends PDNSContractJSON | PDNTContractJSON>(
    id: ArweaveTransactionID,
  ): Promise<T> {
    const localFile = `data/contracts/${id.toString()}.json`;
    const { data } = await axios.get(localFile);
    const pdnsContractState = data as T;
    return pdnsContractState;
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
    initialState: PDNTContractJSON;
    tags?: TransactionTag[];
  }): Promise<string> {
    return JSON.stringify([srcCodeTransactionId, initialState, tags]);
  }
}
