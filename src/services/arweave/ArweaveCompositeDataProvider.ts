import { ArNSContractState, SmartweaveContractSource } from '../../types';

export class ArweaveCompositeDataProvider implements SmartweaveContractSource {
  private _providers: SmartweaveContractSource[];
  // TODO: implement strategy methods
  constructor(providers: SmartweaveContractSource[]) {
    this._providers = providers;
  }

  async getContractState(
    contractId: string,
  ): Promise<ArNSContractState | undefined> {
    // TODO: implement strategy, for now just pull first success
    return Promise.any(
      this._providers.map((p) => p.getContractState(contractId)),
    );
  }
}
