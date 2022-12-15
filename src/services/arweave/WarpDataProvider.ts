import { Warp, WarpFactory } from 'warp-contracts';

import { ArNSContractState, SmartweaveContractSource } from '../../types';

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

    const state = cachedValue.state;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!state.records || !state.fees) {
      throw Error(
        `ArNS contract does not contain required keys.${Object.keys(state)}`,
      );
    }

    return state as ArNSContractState;
  }
}
