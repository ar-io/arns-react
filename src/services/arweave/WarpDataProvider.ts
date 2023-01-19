import Arweave from 'arweave/node/common';
import { Warp, WarpFactory, defaultCacheOptions } from 'warp-contracts';

import {
  ArNSContractState,
  ArweaveTransactionId,
  SmartweaveDataProvider,
} from '../../types';

export class WarpDataProvider implements SmartweaveDataProvider {
  private _warp: Warp;

  constructor(arweave: Arweave) {
    // using arweave gateway to stick to L1 only transactions
    this._warp = WarpFactory.forMainnet(
      {
        ...defaultCacheOptions,
      },
      true,
      arweave,
    );
  }

  async getContractState(
    id: ArweaveTransactionId,
  ): Promise<ArNSContractState | undefined> {
    const contract = this._warp.contract(id);
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

  async writeTransaction(
    id: ArweaveTransactionId,
    payload: {
      [x: string]: any;
      contractTransactionId: ArweaveTransactionId;
    },
  ): Promise<ArweaveTransactionId | undefined> {
    try {
      if (!payload) {
        throw Error('Payload cannot be empty.');
      }
      const contract = this._warp.contract(id).connect('use_wallet');
      const result = await contract.writeInteraction(payload);
      // todo: check for dry write options on writeInteraction
      if (!result) {
        throw Error('No result from write interaction');
      }
      const { originalTxId } = result;

      if (!originalTxId) {
        throw Error('No transaction ID from write interaction');
      }

      return originalTxId;
    } catch (error) {
      console.error('Failed to write TX to warp', error);
      throw error;
    }
  }

  async getContractBalanceForWallet(
    id: ArweaveTransactionId,
    wallet: ArweaveTransactionId,
  ) {
    const state = await this.getContractState(id);
    return state?.balances[wallet] ?? 0;
  }
}
