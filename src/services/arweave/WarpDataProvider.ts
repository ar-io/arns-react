import Arweave from 'arweave/node/common';
import {
  ArWallet,
  LoggerFactory,
  Warp,
  WarpFactory,
  defaultCacheOptions,
} from 'warp-contracts';

import {
  ArweaveTransactionID,
  PDNSContractJSON,
  PDNTContractJSON,
  SmartweaveContractCache,
  SmartweaveContractInteractionProvider,
  TransactionTag,
} from '../../types';
import { byteSize } from '../../utils';
import { SMARTWEAVE_MAX_TAG_SPACE } from '../../utils/constants';

LoggerFactory.INST.logLevel('error');

export class WarpDataProvider
  implements SmartweaveContractInteractionProvider, SmartweaveContractCache
{
  private _warp: Warp;

  constructor(arweave: Arweave) {
    // using arweave gateway to stick to L1 only transactions
    this._warp = WarpFactory.forMainnet(
      {
        ...defaultCacheOptions,
      },
      false,
      arweave,
    );
  }

  async getContractState<T extends PDNTContractJSON | PDNSContractJSON>(
    id: ArweaveTransactionID,
  ): Promise<T> {
    const contract = this._warp.contract(id.toString());
    const { cachedValue } = await contract.readState();

    if (!cachedValue.state) {
      throw Error('Failed to fetch state from Warp.');
    }

    return cachedValue.state as T;
  }

  async writeTransaction(
    id: ArweaveTransactionID,
    payload: {
      function: string;
      [x: string]: any;
    },
  ): Promise<ArweaveTransactionID | undefined> {
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
    initialState: PDNTContractJSON;
    tags?: TransactionTag[];
  }): Promise<string> {
    const tagSize = byteSize(JSON.stringify(tags));

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
  }

  /* eslint-disable */
  async getContractsForWallet(
    sourceCodeTxIds: ArweaveTransactionID[],
    address: ArweaveTransactionID,
  ): Promise<{ ids: ArweaveTransactionID[] }> {
    throw Error('Not implemented!');
  }
  /* eslint-enable */
}
