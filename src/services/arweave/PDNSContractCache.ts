import {
  ArweaveTransactionID,
  PDNSContractJSON,
  PDNTContractJSON,
  SmartweaveContractCache,
} from '../../types';

export class PDNSContractCache implements SmartweaveContractCache {
  private _url: string;

  constructor(url: string) {
    this._url = url;
  }

  async getContractState<T extends PDNTContractJSON | PDNSContractJSON>(
    id: ArweaveTransactionID,
  ): Promise<T> {
    const res = await fetch(`${this._url}/contract/${id.toString()}`);
    const { state } = await res.json();
    return state as T;
  }

  async getContractBalanceForWallet(
    id: ArweaveTransactionID,
    wallet: ArweaveTransactionID,
  ): Promise<number> {
    const res = await fetch(
      `${this._url}/contract/${id.toString()}/balances/${wallet.toString()}`,
    );
    const { balance } = await res.json();
    return +balance ?? 0;
  }

  async getContractsForWallet(
    sourceCodeTxIds: ArweaveTransactionID[],
    address: ArweaveTransactionID,
  ): Promise<{ ids: ArweaveTransactionID[] }> {
    const res = await fetch(
      `${this._url}/wallet/${address.toString()}/contracts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceCodeTxIds: sourceCodeTxIds.map((s) => s.toString()),
        }),
      },
    );
    const { contractIds } = await res.json();
    return {
      ids: contractIds.map((id: string) => new ArweaveTransactionID(id)),
    };
  }
}