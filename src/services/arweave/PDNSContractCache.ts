import {
  ArweaveTransactionID,
  ContractInteraction,
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
    contractTxId: ArweaveTransactionID,
  ): Promise<T> {
    const res = await fetch(`${this._url}/contract/${contractTxId.toString()}`);
    const { state } = await res.json();
    return state as T;
  }

  async getContractBalanceForWallet(
    contractTxId: ArweaveTransactionID,
    wallet: ArweaveTransactionID,
  ): Promise<number> {
    const res = await fetch(
      `${
        this._url
      }/contract/${contractTxId.toString()}/balances/${wallet.toString()}`,
    );
    const { balance } = await res.json();
    return +balance ?? 0;
  }

  async getContractsForWallet(
    address: ArweaveTransactionID,
  ): Promise<{ ids: ArweaveTransactionID[] }> {
    const res = await fetch(
      `${this._url}/wallet/${address.toString()}/contracts`,
    );
    const { contractIds } = await res.json();
    return {
      ids: contractIds.map((id: string) => new ArweaveTransactionID(id)),
    };
  }

  async getContractInteractions(
    contractTxId: ArweaveTransactionID,
  ): Promise<ContractInteraction[]> {
    const res = await fetch(
      `${this._url}/contract/${contractTxId.toString()}/interactions`,
    );
    const { interactions } = await res.json();
    return interactions;
  }
}
