import Arweave from 'arweave/node/common';
import {
  ArWallet,
  Warp,
  WarpFactory,
  defaultCacheOptions,
} from 'warp-contracts';

import {
  ANTContractJSON,
  ArweaveTransactionID,
  TransactionTag,
} from '../../types';
import { ArNSContractState, SmartweaveDataProvider } from '../../types';
import { SMARTWEAVE_MAX_TAG_SPACE } from '../../utils/constants';
import { isArweaveTransactionID } from '../../utils/searchUtils';

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
    id: ArweaveTransactionID,
  ): Promise<ArNSContractState | undefined> {
    const contract = this._warp.contract(id.toString());
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
    id: ArweaveTransactionID,
    payload: {
      function: string;
      [x: string]: any;
    },
  ): Promise<ArweaveTransactionID | undefined> {
    try {
      const payloadSize = new Blob([JSON.stringify(payload)]).size;
      if (!payload) {
        throw Error('Payload cannot be empty.');
      }
      if (payloadSize > SMARTWEAVE_MAX_TAG_SPACE) {
        throw new Error(
          'Payload too large for tag space, reduce the size of the data in payload.',
        );
      }
      const contract = this._warp.contract(id.toString()).connect('use_wallet');
      const result = await contract.writeInteraction(payload);
      // todo: check for dry write options on writeInteraction
      if (!result) {
        throw Error('No result from write interaction');
      }
      const { originalTxId } = result;

      if (!originalTxId) {
        throw Error('No transaction ID from write interaction');
      }

      return new ArweaveTransactionID(originalTxId);
    } catch (error) {
      console.error('Failed to write TX to warp', error);
      throw error;
    }
  }

  async getContractBalanceForWallet(
    id: ArweaveTransactionID,
    wallet: ArweaveTransactionID,
  ) {
    const state = await this.getContractState(id);
    return state?.balances[wallet.toString()] ?? 0;
  }
  /**
   *
   * @param srcCodeTransactionId - ArweaveTransactionId of the source code used to deploy contract
   * @param initialState - typeof ANTContractJSON or ArweaveTransactionID - depending on the stateType chosen, either the json initial state of the contract to deploy, or the on-chain states TXID
   * @param stateType - type of 'TXID' | 'TAG' | 'DATA' - TXID indicates use of a prexisting state on-chain, TAG and DATA use json states locally. DATA puts the state in the data key of the transaction, TAG puts the state in the tag.
   * @returns
   */
  async deployContract({
    srcCodeTransactionId,
    initialState,
    stateType,
    tags = [],
  }: {
    srcCodeTransactionId: ArweaveTransactionID;
    initialState: ANTContractJSON | ArweaveTransactionID;
    stateType: 'TXID' | 'TAG' | 'DATA';
    tags: TransactionTag[];
  }): Promise<string | undefined> {
    const stateSize = new Blob([JSON.stringify(initialState)]).size;
    const tagSize = new Blob([JSON.stringify(tags)]).size;

    try {
      if (!initialState) {
        throw new Error('Must have an initial state to deploy a contract');
      }
      if (
        isArweaveTransactionID(initialState.toString()) &&
        stateType !== 'TXID'
      ) {
        throw new Error(
          'Mismatching initial state and state type. TXIDs are not valid contract states. If the intent was to use an on chain state, set the stateType parameter to TXID',
        );
      }
      if (stateSize > SMARTWEAVE_MAX_TAG_SPACE && stateType === 'TAG') {
        throw new Error(
          `state too large for tag space, must be under ${SMARTWEAVE_MAX_TAG_SPACE} bytes.`,
        );
      }
      if (tagSize > SMARTWEAVE_MAX_TAG_SPACE) {
        throw new Error(
          `tags too large for tag space, must be under ${SMARTWEAVE_MAX_TAG_SPACE} bytes.`,
        );
      }
      if (
        stateSize + tagSize > SMARTWEAVE_MAX_TAG_SPACE &&
        stateType !== 'TXID'
      ) {
        throw new Error(
          `Combined size of tags (${tagSize} bytes) and state (${stateSize} bytes) too large for tag space, must be under ${SMARTWEAVE_MAX_TAG_SPACE} bytes. Reduce the tags or use a different state deployment method.`,
        );
      }
      const deploymentPayload: {
        wallet: ArWallet;
        initState: string;
        srcTxId: string;
        tags: TransactionTag[];
      } = {
        wallet: 'use_wallet',
        initState: '',
        srcTxId: srcCodeTransactionId.toString(),
        tags: tags,
      };

      if (stateType === 'TXID') {
        deploymentPayload.tags = [
          { name: 'Init-State-TX', value: initialState.toString() },
          ...deploymentPayload.tags,
        ];
      }
      if (stateType === 'TAG') {
        deploymentPayload.tags = [
          { name: 'Init-State', value: JSON.stringify(initialState) },
          ...deploymentPayload.tags,
        ];
      }
      if (stateType === 'DATA') {
        deploymentPayload.initState = JSON.stringify(initialState);
      }
      const { contractTxId } = await this._warp.deployFromSourceTx(
        deploymentPayload,
        true,
      );

      if (!contractTxId) {
        throw new Error('Deploy failed.');
      }

      return contractTxId;
    } catch (error) {
      console.error(error);
      return;
    }
  }
}
