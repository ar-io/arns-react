import {
  ANTContractState,
  ArNSContractState,
  ArweaveTransactionId,
  SmartweaveContractSource,
} from '../../types';

export class ArweaveCompositeDataProvider implements SmartweaveContractSource {
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

  async writeTransaction(payload: {
    [x: string]: any;
    contractTransactionId: ArweaveTransactionId;
  }): Promise<ArweaveTransactionId | undefined> {
    if (!payload) {
      throw Error('Payload cannot be empty.');
    }

    // Sequentially write - to avoid posting to multiple sources
    for (const provider of this._providers) {
      const result = await provider.writeTransaction(payload);
      if (result) {
        return result;
      }
    }
  }
}
