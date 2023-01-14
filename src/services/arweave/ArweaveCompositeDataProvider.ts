import {
  ANTContractState,
  ArNSContractState,
  ArweaveTransactionId,
  SmartweaveContractSource,
} from '../../types';

export class ArweaveCompositeDataProvider implements SmartweaveContractSource {
  // NOTE: this class should not have any logic for performing queries itself, but rather logic for getting results from
  // an array of providers, using different strategies such as Promise.race or Promise.all.
  private _providers: SmartweaveContractSource[];

  // TODO: implement strategy methods
  constructor(providers: SmartweaveContractSource[]) {
    this._providers = providers;
  }

  async getContractState(
    contractId: string,
  ): Promise<ArNSContractState | ANTContractState | undefined> {
    // TODO: implement strategy, for now just pull first success
    return Promise.any(
      this._providers.map((p) => p.getContractState(contractId)),
    );
  }

  async writeTransaction(
    contractId: ArweaveTransactionId,
    payload: {
      [x: string]: any;
      contractTransactionId: ArweaveTransactionId;
    },
  ): Promise<ArweaveTransactionId | undefined> {
    if (!payload) {
      throw Error('Payload cannot be empty.');
    }

    // Sequentially write - to avoid posting to multiple sources
    for (const provider of this._providers) {
      // TODO: add error handling to wrap failed ones and try the next
      const result = await provider.writeTransaction(contractId, payload);
      if (result) {
        return result;
      }
    }
  }

  async getContractBalanceForWallet(
    contractId: string,
    wallet: string,
  ): Promise<number> {
    return Promise.any(
      this._providers.map((p) =>
        p.getContractBalanceForWallet(contractId, wallet),
      ),
    );
  }

  async getContractConfirmations(id: ArweaveTransactionId) {
    return Promise.any(
      this._providers.map((p) => p.getContractConfirmations(id)),
    );
  }
}
