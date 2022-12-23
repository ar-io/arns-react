import { Warp, WarpFactory } from 'warp-contracts';

import {
  ANTContractState,
  ArNSContractState,
  ArweaveTransactionId,
  SmartweaveContractSource,
} from '../../types';

export class ArweaveCompositeDataProvider implements SmartweaveContractSource {
  private _providers: SmartweaveContractSource[];
  private _warp: Warp;
  contractId: any;
  // TODO: implement strategy methods
  constructor(providers: SmartweaveContractSource[]) {
    this._providers = providers;
    this._warp = WarpFactory.forMainnet();
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
    payload: any,
    dryWrite: boolean = true,
  ): Promise<ArweaveTransactionId | undefined> {
    try {
      if (!payload) {
        throw Error(`interaction data is missing from payload: ${payload}`);
      }
      const result = await Promise.any(
        this._providers.map((provider) => provider.writeTransaction(payload)),
      );
      // todo: check for dry write options on writeInteraction
      if (!result) {
        throw Error('No result from write interation');
      }
      // todo validate bundlr response
      return result;
    } catch (Error) {
      console.error(Error);
      return;
    }
  }
  async connect(): Promise<void> {
    try {
      console.log(this.contractId);
      await this._warp.contract(this.contractId).connect('use_wallet');
      return;
    } catch (Error) {
      console.error(Error);
      return;
    }
  }
}
