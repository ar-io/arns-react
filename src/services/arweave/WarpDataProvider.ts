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
import {
  ATOMIC_REGISTRATION_INPUT,
  SMARTWEAVE_INTERACTION_TAGS,
  SMARTWEAVE_MAX_TAG_SPACE,
} from '../../utils/constants';
import { byteSize } from '../../utils/searchUtils';

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
      const payloadSize = byteSize(JSON.stringify(payload));
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
      // TODO: check for dry write options on writeInteraction
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

  async deployContract({
    srcCodeTransactionId,
    initialState,
    tags = [],
  }: {
    srcCodeTransactionId: ArweaveTransactionID;
    initialState: ANTContractJSON;
    tags?: TransactionTag[];
  }): Promise<string> {
    const tagSize = byteSize(JSON.stringify(tags));

    try {
      if (!initialState) {
        throw new Error('Must have an initial state to deploy a contract');
      }

      if (tagSize > SMARTWEAVE_MAX_TAG_SPACE) {
        throw new Error(
          `tags too large for tag space, must be under ${SMARTWEAVE_MAX_TAG_SPACE} bytes.`,
        );
      }

      const deploymentPayload: {
        wallet: ArWallet;
        initState: string;
        srcTxId: string;
        tags: TransactionTag[];
      } = {
        wallet: 'use_wallet',
        initState: JSON.stringify(initialState),
        srcTxId: srcCodeTransactionId.toString(),
        tags: tags,
      };

      const { contractTxId } = await this._warp.deployFromSourceTx(
        deploymentPayload,
        true,
      );

      if (!contractTxId) {
        throw new Error('Deploy failed.');
      }

      return contractTxId;
    } catch (error: any) {
      console.error(error);
      return error;
    }
  }
  async registerAtomicName({
    srcCodeTransactionId,
    initialState,
    domain,
  }: {
    srcCodeTransactionId: ArweaveTransactionID;
    initialState: ANTContractJSON;
    domain: string;
  }): Promise<string | undefined> {
    try {
      if (!domain) {
        throw new Error('No domain provided');
      }
      const tags = [...SMARTWEAVE_INTERACTION_TAGS];
      const input = { ...ATOMIC_REGISTRATION_INPUT };
      input.name = domain;
      tags[2].value = JSON.stringify(input);
      const result = await this.deployContract({
        srcCodeTransactionId,
        initialState,
        tags,
      });
      if (!result) {
        throw new Error();
      }
      return result;
    } catch (error) {
      console.error(error);
    }
  }
}
