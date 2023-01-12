import Arweave from 'arweave/node/common';
import { Warp, WarpFactory, defaultCacheOptions } from 'warp-contracts';

import {
  ArNSContractState,
  ArweaveTransactionId,
  SmartweaveContractSource,
} from '../../types';

export class WarpDataProvider implements SmartweaveContractSource {
  private _warp: Warp;
  arweave: Arweave;

  constructor(arweave: Arweave) {
    // using arweave gateway to stick to L1 only transactions
    this._warp = WarpFactory.forMainnet(
      {
        ...defaultCacheOptions,
      },
      true,
      arweave,
    );
    this.arweave = arweave;
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

  async writeTransaction(
    contractId: ArweaveTransactionId,
    payload: {
      [x: string]: any;
      contractTransactionId: ArweaveTransactionId;
    },
  ): Promise<ArweaveTransactionId | undefined> {
    try {
      if (!payload) {
        throw Error('Payload cannot be empty.');
      }
      const contract = this._warp.contract(contractId).connect('use_wallet');
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

      return originalTxId;
    } catch (error) {
      console.error('Failed to write TX to warp', error);
      throw error;
    }
  }

  async getContractBalanceForWallet(
    contractId: ArweaveTransactionId,
    wallet: ArweaveTransactionId,
  ) {
    const state = await this.getContractState(contractId);
    return state?.balances[wallet] ?? 0;
  }

  async getContractConfirmations(id: ArweaveTransactionId) {
    try {
      const confirmations = await this.arweave.api
        .get(`/tx/${id}/status`)
        .then((res: any) => {
          return res.data.number_of_confirmations;
        });
      return confirmations;
    } catch (error) {
      console.error(error);
      return 0;
    }
  }
}
