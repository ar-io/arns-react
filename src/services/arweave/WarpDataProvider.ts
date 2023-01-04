import { Warp, WarpFactory } from 'warp-contracts';

import {
  ArNSContractState,
  ArweaveTransactionId,
  SmartweaveContractSource,
} from '../../types';

export class WarpDataProvider implements SmartweaveContractSource {
  private _warp: Warp;

  constructor() {
    this._warp = WarpFactory.forMainnet();
  }

  async getContractState(
    contractId: string,
  ): Promise<ArNSContractState | undefined> {
    const contract = this._warp.contract(contractId);
    const { cachedValue } = await contract.readState();

    if (!cachedValue.state) {
      throw Error('Failed to fetch state from Warp.');
    }

    const state = cachedValue.state as any;

    // TODO: move this validation to separate interface function
    if (!state.records) {
      throw Error(
        `Smartweave contract does not contain required keys.${Object.keys(
          state,
        )}`,
      );
    }

    return state;
  }

  async writeTransaction(payload: {
    [x: string]: any;
    contractTransactionId: ArweaveTransactionId;
  }): Promise<ArweaveTransactionId | undefined> {
    try {
      if (!payload) {
        throw Error('Payload cannot be empty.');
      }
      const { contractTransactionId } = payload;
      const contract = this._warp
        .contract(contractTransactionId)
        .connect('use_wallet');
      const result = await contract.writeInteraction(payload);
      // todo: check for dry write options on writeInteraction
      if (!result) {
        throw Error('No result from write interaction');
      }
      const { originalTxId, bundlrResponse } = result;

      if (!originalTxId) {
        throw Error('No transaction ID from write interaction');
      }

      if (!bundlrResponse) {
        throw Error('No response from bundlr for write interaction.');
      }

      return bundlrResponse.id;
    } catch (error) {
      console.error('Failed to write TX to warp', error);
      throw error;
    }
  }
}
