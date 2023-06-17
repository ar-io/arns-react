import Arweave from 'arweave/node/common';
import {
  ArWallet,
  LoggerFactory,
  Warp,
  WarpFactory,
  defaultCacheOptions,
} from 'warp-contracts';
import { DeployPlugin } from 'warp-contracts-plugin-deploy';

import {
  ArweaveTransactionID,
  ContractInteraction,
  PDNSContractJSON,
  PDNTContractJSON,
  SmartweaveContractCache,
  SmartweaveContractInteractionProvider,
  TransactionCache,
  TransactionTag,
} from '../../types';
import { byteSize } from '../../utils';
import {
  ATOMIC_REGISTRATION_INPUT,
  SMARTWEAVE_INTERACTION_TAGS,
  SMARTWEAVE_MAX_TAG_SPACE,
} from '../../utils/constants';
import { LocalStorageCache } from '../cache/LocalStorageCache';

LoggerFactory.INST.logLevel('error');

export class WarpDataProvider
  implements SmartweaveContractInteractionProvider, SmartweaveContractCache
{
  private _warp: Warp;
  private _cache: TransactionCache;

  constructor(
    arweave: Arweave,
    cache: TransactionCache = new LocalStorageCache(),
  ) {
    // using ar.io gateway and stick to L1 only transactions
    this._warp = WarpFactory.forMainnet(
      {
        ...defaultCacheOptions,
      },
      true,
      arweave,
    ).use(new DeployPlugin());
    this._cache = cache;
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

  async writeTransaction({
    walletAddress,
    contractTxId,
    payload,
  }: {
    walletAddress: ArweaveTransactionID;
    contractTxId: ArweaveTransactionID;
    payload: {
      function: string;
      [x: string]: any;
    };
    dryWrite?: boolean;
  }): Promise<ArweaveTransactionID | undefined> {
    const payloadSize = byteSize(JSON.stringify(payload));
    if (!payload) {
      throw Error('Payload cannot be empty.');
    }
    if (payloadSize > SMARTWEAVE_MAX_TAG_SPACE) {
      throw new Error(
        'Payload too large for tag space, reduce the size of the data in payload.',
      );
    }
    const contract = this._warp
      .contract(contractTxId.toString())
      .connect('use_wallet');
    const result = await contract.writeInteraction(payload, {
      disableBundling: true,
    });
    // TODO: check for dry write options on writeInteraction
    if (!result) {
      throw Error('No result from write interaction');
    }
    const { originalTxId } = result;

    if (!originalTxId) {
      throw Error('No transaction ID from write interaction');
    }

    this._cache.push(walletAddress.toString(), {
      id: originalTxId,
      contractTxId: contractTxId.toString(),
      payload,
      type: 'interaction',
    });

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
    walletAddress,
    srcCodeTransactionId,
    initialState,
    tags = [],
    data,
  }: {
    walletAddress: ArweaveTransactionID;
    srcCodeTransactionId: ArweaveTransactionID;
    initialState: PDNTContractJSON;
    tags?: TransactionTag[];
    data?: { 'Content-Type': string; body: string | Uint8Array };
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
      data?: { 'Content-Type': string; body: string | Uint8Array } | undefined;
    } = {
      wallet: 'use_wallet',
      initState: JSON.stringify(initialState),
      srcTxId: srcCodeTransactionId.toString(),
      tags: tags,
      data,
    };
    console.log(deploymentPayload);

    const { contractTxId } = await this._warp.deployFromSourceTx(
      deploymentPayload,
      true, // disable bundling
    );

    if (!contractTxId) {
      throw new Error('Deploy failed.');
    }

    // TODO: emit event on successfully transaction
    this._cache.push(walletAddress.toString(), {
      contractTxId,
      id: contractTxId,
      payload: deploymentPayload,
      type: 'deploy',
    });
    // Pulls out registration interaction and caches it
    // TODO: make this able to cache batch interactions on multiple contracts at once.
    if (tags && contractTxId) {
      const input = tags.find((tag) => tag.name === 'Input')?.value;
      const contractId = tags.find((tag) => tag.name === 'Contract')?.value;
      if (!input || !contractId) {
        throw new Error(
          'Could not cache atomic transaction, missing info from tags.',
        );
      }
      const interactionPayload = JSON.parse(input);
      this._cache.push(walletAddress.toString(), {
        id: contractTxId,
        contractTxId: contractId,
        payload: interactionPayload,
        type: 'interaction',
      });
    }

    return contractTxId;
  }

  async registerAtomicName({
    walletAddress,
    registryId,
    srcCodeTransactionId,
    initialState,
    domain,
    file,
  }: {
    walletAddress: ArweaveTransactionID;
    registryId: ArweaveTransactionID;
    srcCodeTransactionId: ArweaveTransactionID;
    initialState: PDNTContractJSON;
    domain: string;
    file?: File;
  }): Promise<string | undefined> {
    try {
      if (!domain) {
        throw new Error('No domain provided');
      }
      const tags = [...SMARTWEAVE_INTERACTION_TAGS];
      const input = { ...ATOMIC_REGISTRATION_INPUT };
      input.name = domain;
      tags[1].value = registryId.toString();
      tags[2].value = JSON.stringify(input);
      const buffer = await file?.arrayBuffer();
      const fileArray = buffer ? new Uint8Array(buffer) : undefined;

      console.log({ file, buffer, fileArray });

      const result = await this.deployContract({
        walletAddress,
        srcCodeTransactionId,
        initialState,
        tags,
        data:
          !file || !fileArray
            ? undefined
            : {
                'Content-Type': file.type,
                body: fileArray,
              },
      });
      if (!result) {
        throw new Error('Could not deploy atomic contract');
      }
      return result;
    } catch (error) {
      console.error(error);
    }
  }

  /* eslint-disable */
  async getContractsForWallet(
    address: ArweaveTransactionID,
  ): Promise<{ ids: ArweaveTransactionID[] }> {
    throw Error('Not implemented!');
  }

  async getContractInteractions(
    id: ArweaveTransactionID,
  ): Promise<ContractInteraction[]> {
    throw Error('Not implemented!');
  }

  async getPendingContractInteractions(
    id: ArweaveTransactionID,
    key: string,
  ): Promise<ContractInteraction[]> {
    throw Error('Not implemented');
  }
  /* eslint-enable */

  async getRecord(
    record: string,
    contractId: ArweaveTransactionID,
  ): Promise<PDNTContractJSON | undefined> {
    const result = await this._warp.contract(contractId.toString()).viewState({
      function: 'getRecord',
      record,
    });
    console.log(result);
    return result.state as PDNTContractJSON;
  }
}
