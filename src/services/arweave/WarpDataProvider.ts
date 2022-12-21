import { Warp, WarpFactory } from 'warp-contracts';

import {
  ArNSContractState,
  ArweaveTransactionId,
  SmartweaveContractSource,
} from '../../types';

export class WarpDataProvider implements SmartweaveContractSource {
  private _warp: Warp;
  contractId: any;

  constructor() {
    this._warp = WarpFactory.forMainnet();
    this.contractId = null;
  }

  async getContractState(
    contractId: string,
  ): Promise<ArNSContractState | undefined> {
    const contract = this._warp.contract(contractId);
    this.contractId = contractId;
    const { cachedValue } = await contract.readState();

    if (!cachedValue.state) {
      throw Error('Failed to fetch state from Warp.');
    }

    const state = cachedValue.state as any;

    if (!state.records) {
      throw Error(
        `ArNS contract does not contain required keys.${Object.keys(state)}`,
      );
    }

    return state as ArNSContractState;
  }

  async writeTransaction(
    payload: any,
    dryWrite: boolean = true,
  ): Promise<ArweaveTransactionId | undefined> {
    try {
      const contract = this._warp.contract(payload.contractTransactionId);
      const result = await contract.writeInteraction(payload);
      // todo: check for dry write options on writeInteraction
      if (!result) {
        throw Error('No result from write interation');
      }
      const { bundlrResponse, originalTxId } = result;
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
