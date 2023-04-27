import {
  ArweaveTransactionID,
  PDNTContractJSON,
  PdnsContractJSON,
  SmartweaveContractCache,
} from '../../types';

export class PDNSContractCache implements SmartweaveContractCache {
  private _url: string;

  constructor(url: string) {
    this._url = url;
  }

  async getContractState<T extends PDNTContractJSON | PdnsContractJSON>(
    id: ArweaveTransactionID,
  ): Promise<T> {
    const res = await fetch(`${this._url}/contract/${id.toString()}`);
    const { state } = await res.json();
    return state as T;
  }

  async getContractBalanceForWallet<
    T extends PDNTContractJSON | PdnsContractJSON,
  >(id: ArweaveTransactionID, wallet: ArweaveTransactionID): Promise<number> {
    const state = await this.getContractState<T>(id);
    return state?.balances[wallet.toString()] ?? 0;
  }
}
