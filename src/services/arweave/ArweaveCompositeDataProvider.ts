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
    this.contractId = null;
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
      const contract = this._warp
        .contract('bLAgYxAdX2Ry-nt6aH2ixgvJXbpsEYm28NgJgyqfs-U')
        .connect('use_wallet');
      console.log(contract);
      if (!payload) {
        throw Error(`interaction data is missing from payload: ${payload}`);
      }
      const result = await contract.writeInteraction(payload);
      // todo: check for dry write options on writeInteraction
      console.log(result);
      if (!result) {
        throw Error('No result from write interation');
      }
      const { bundlrResponse, originalTxId } = result;
      console.log(bundlrResponse, originalTxId);
      if (!originalTxId) {
        throw Error('No transaction ID from write interaction');
      }

      // todo validate bundlr response
      return originalTxId;
    } catch (Error) {
      console.error(Error);
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
