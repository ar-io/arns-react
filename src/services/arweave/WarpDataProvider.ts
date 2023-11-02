import Arweave from 'arweave/node/common';
import {
  ArWallet,
  LoggerFactory,
  Tags,
  Warp,
  WarpFactory,
  WriteInteractionResponse,
  defaultCacheOptions,
} from 'warp-contracts';
import { DeployPlugin } from 'warp-contracts-plugin-deploy';

import {
  ArweaveTransactionID,
  KVCache,
  PDNTContractJSON,
  SmartweaveContractInteractionProvider,
  TRANSACTION_TYPES,
  TransactionCache,
} from '../../types';
import {
  buildSmartweaveInteractionTags,
  byteSize,
  withExponentialBackoff,
} from '../../utils';
import {
  ARNS_REGISTRY_ADDRESS,
  ATOMIC_REGISTRATION_INPUT,
  SMARTWEAVE_MAX_TAG_SPACE,
} from '../../utils/constants';
import { ContractInteractionCache } from '../caches/ContractInteractionCache';
import { LocalStorageCache } from '../caches/LocalStorageCache';

LoggerFactory.INST.logLevel('error');

export class WarpDataProvider implements SmartweaveContractInteractionProvider {
  private _warp: Warp;
  private _cache: TransactionCache & KVCache;

  constructor(
    arweave: Arweave,
    cache: TransactionCache & KVCache = new ContractInteractionCache(
      new LocalStorageCache(),
    ),
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

  async writeTransaction({
    walletAddress,
    contractTxId,
    payload,
    dryWrite = true,
    tags,
  }: {
    walletAddress: ArweaveTransactionID;
    contractTxId: ArweaveTransactionID;
    payload: {
      function: string;
      [x: string]: any;
    };
    dryWrite?: boolean;
    tags: Tags;
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

    const contract = this._warp // eval options were required due to change in manifest. This is causing an issue where it is causing a delay for returning the txid due to the `waitForConfirmation` option. This should be removed from the eval manifest if we dont want to make the user wait.
      .contract(contractTxId.toString())
      .setEvaluationOptions(
        contractTxId.toString() === ARNS_REGISTRY_ADDRESS
          ? {
              waitForConfirmation: false,
              internalWrites: true,
              updateCacheForEachInteraction: true,
              unsafeClient: 'skip',
              maxCallDepth: 3,
            }
          : {},
      )
      .connect('use_wallet');
    if (dryWrite) {
      const dryWriteResults = await contract.dryWrite(
        payload,
        walletAddress.toString(),
      );

      // because we are manually constructing the tags, we want to verify them immediately and always
      // an undefined valid means the transaction is valid
      if (dryWriteResults.type === 'error') {
        throw new Error(
          `Contract interaction detected to be invalid: ${
            dryWriteResults?.originalErrorMessages
              ? Object.entries(dryWriteResults?.originalErrorMessages)
                  .map(([name, errorMessage]) => `${name}: ${errorMessage}`)
                  .join(',')
              : dryWriteResults.errorMessage
          }`,
        );
      }
    }
    const result =
      await withExponentialBackoff<WriteInteractionResponse | null>({
        fn: () =>
          contract.writeInteraction(payload, {
            disableBundling: true,
            tags: tags,
          }),
        shouldRetry: (result) => !result,
        maxTries: 5,
        initialDelay: 100,
      });
    // TODO: check for dry write options on writeInteraction
    if (!result) {
      throw Error('No result from write interaction');
    }
    const { originalTxId } = result;

    if (!originalTxId) {
      throw Error('No transaction ID from write interaction');
    }

    this._cache.push(contractTxId.toString(), {
      id: originalTxId,
      contractTxId: contractTxId.toString(),
      payload,
      type: 'interaction',
      deployer: walletAddress.toString(),
    });

    return new ArweaveTransactionID(originalTxId);
  }

  async deployContract({
    walletAddress,
    srcCodeTransactionId,
    initialState,
    tags = [],
  }: {
    walletAddress: ArweaveTransactionID;
    srcCodeTransactionId: ArweaveTransactionID;
    initialState: PDNTContractJSON;
    tags?: Tags;
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
      tags: Tags;
    } = {
      wallet: 'use_wallet',
      initState: JSON.stringify(initialState),
      srcTxId: srcCodeTransactionId.toString(),
      tags: tags,
    };

    const { contractTxId } = await this._warp.deployFromSourceTx(
      deploymentPayload,
      true, // disable bundling
    );

    if (!contractTxId) {
      throw new Error('Deploy failed.');
    }

    // TODO: emit event on successfully transaction
    this._cache.push(contractTxId.toString(), {
      contractTxId,
      id: contractTxId,
      payload: deploymentPayload,
      type: 'deploy',
      deployer: walletAddress.toString(),
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
      this._cache.push(contractId, {
        id: contractTxId,
        contractTxId: contractId,
        payload: interactionPayload,
        type: 'interaction',
        deployer: walletAddress.toString(),
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
    type,
    years,
    auction,
    qty,
  }: {
    walletAddress: ArweaveTransactionID;
    registryId: ArweaveTransactionID;
    srcCodeTransactionId: ArweaveTransactionID;
    initialState: PDNTContractJSON;
    domain: string;
    type: TRANSACTION_TYPES;
    years?: number;
    auction: boolean;
    qty: number;
  }): Promise<string | undefined> {
    if (!domain) {
      throw new Error('No domain provided');
    }

    const input = {
      ...ATOMIC_REGISTRATION_INPUT,
      name: domain,
      type,
      years,
      auction,
      qty,
    };
    const tags = buildSmartweaveInteractionTags({
      contractId: registryId,
      input,
    });

    // TODO: have an API to get evaluation options from the contract
    const contract = this._warp // eval options were required due to change in manifest. This is causing an issue where it is causing a delay for returning the txid due to the `waitForConfirmation` option. This should be removed from the eval manifest if we dont want to make the user wait.
      .contract(ARNS_REGISTRY_ADDRESS)
      .setEvaluationOptions({
        waitForConfirmation: true,
        internalWrites: true,
        updateCacheForEachInteraction: true,
        unsafeClient: 'skip',
        maxCallDepth: 3,
      })
      .connect('use_wallet');
    // because we are manually constructing the tags, we want to verify them immediately and always
    const dryWriteResults = await contract.dryWrite(
      input,
      walletAddress.toString(),
    );
    // an undefined valid means the transaction is valid
    if (dryWriteResults.type === 'error') {
      throw new Error(
        `Contract interaction detected to be invalid: ${
          dryWriteResults?.originalErrorMessages
            ? Object.entries(dryWriteResults?.originalErrorMessages)
                .map(([name, errorMessage]) => `${name}: ${errorMessage}`)
                .join(',')
            : dryWriteResults.errorMessage
        }`,
      );
    }

    const result = await this.deployContract({
      walletAddress,
      srcCodeTransactionId,
      initialState,
      tags,
    });
    if (!result) {
      throw new Error('Could not deploy atomic contract');
    }
    return result;
  }
}
