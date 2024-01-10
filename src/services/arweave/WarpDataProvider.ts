import { ContractInteractionError } from '@src/utils/errors';
import eventEmitter from '@src/utils/events';
import Arweave from 'arweave/node/common';
import {
  ArWallet,
  Contract,
  CustomSignature,
  EvaluationManifest,
  InteractionResult,
  LoggerFactory,
  Tags,
  Warp,
  WarpFactory,
  WriteInteractionResponse,
  defaultCacheOptions,
} from 'warp-contracts';
import { DeployPlugin } from 'warp-contracts-plugin-deploy';

import {
  ANTContractJSON,
  ArweaveWalletConnector,
  KVCache,
  SmartweaveContractInteractionProvider,
  TRANSACTION_TYPES,
  TransactionCache,
} from '../../types';
import {
  buildSmartweaveInteractionTags,
  byteSize,
  tagsToObject,
  withExponentialBackoff,
} from '../../utils';
import {
  ARNS_REGISTRY_ADDRESS,
  ARNS_SERVICE_API,
  ATOMIC_REGISTRATION_INPUT,
  SMARTWEAVE_MAX_TAG_SPACE,
} from '../../utils/constants';
import { ContractInteractionCache } from '../caches/ContractInteractionCache';
import { LocalStorageCache } from '../caches/LocalStorageCache';
import { ArweaveTransactionID } from './ArweaveTransactionID';

LoggerFactory.INST.logLevel('error');

export class WarpDataProvider implements SmartweaveContractInteractionProvider {
  private _warp: Warp;
  private _cache: TransactionCache & KVCache;
  private _arweave: Arweave;
  private _walletConnector: ArweaveWalletConnector;

  constructor(
    arweave: Arweave,
    walletConnector: ArweaveWalletConnector,
    cache: TransactionCache & KVCache = new ContractInteractionCache(
      new LocalStorageCache(),
    ),
  ) {
    this._arweave = arweave;
    // using ar.io gateway and stick to L1 only transactions
    this._warp = WarpFactory.forMainnet(
      {
        ...defaultCacheOptions,
      },
      true,
      arweave,
    ).use(new DeployPlugin());
    this._cache = cache;
    this._walletConnector = walletConnector;
  }

  private async getContractManifest({
    contractTxId,
  }: {
    contractTxId: ArweaveTransactionID;
  }): Promise<EvaluationManifest> {
    const { tags: encodedTags } = await this._arweave.transactions
      .get(contractTxId.toString())
      .catch(() => ({
        tags: undefined,
      }));
    const decodedTags = encodedTags ? tagsToObject(encodedTags) : {};
    const contractManifestString = decodedTags['Contract-Manifest'] ?? '{}';
    const contractManifest = JSON.parse(contractManifestString);
    return contractManifest;
  }

  async writeTransaction({
    walletAddress,
    contractTxId,
    payload,
    dryWrite = true,
    tags,
    interactionDetails,
  }: {
    walletAddress: ArweaveTransactionID;
    contractTxId: ArweaveTransactionID;
    payload: {
      function: string;
      [x: string]: any;
    };
    dryWrite?: boolean;
    tags: Tags;
    interactionDetails?: Record<string, any>;
  }): Promise<ArweaveTransactionID | undefined> {
    let useUnsafe = false;
    const payloadSize = byteSize(JSON.stringify(payload));
    if (!payload) {
      throw Error('Payload cannot be empty.');
    }
    if (payloadSize > SMARTWEAVE_MAX_TAG_SPACE) {
      throw new Error(
        'Payload too large for tag space, reduce the size of the data in payload.',
      );
    }

    const { evaluationOptions = {} } = await this.getContractManifest({
      contractTxId,
    });

    const contract = await this._warp
      .contract(contractTxId.toString())
      .setEvaluationOptions(evaluationOptions)
      .connect(this._walletConnector.signer)
      // TODO: add to our SmartweaveContractInterface a method that gets the full response of the service with `sortKey`
      .syncState(`${ARNS_SERVICE_API}/v1/contract/${contractTxId.toString()}`);

    if (dryWrite) {
      const dryWriteResults = await this.dryWrite({
        walletAddress,
        contract,
        payload,
      }).catch((e) => {
        console.error(e);
        eventEmitter.emit('error', e);
        useUnsafe = true; // if dry write breaks, use unsafe write to deploy the transaction
      });
      // because we are manually constructing the tags, we want to verify them immediately and always
      // an undefined valid means the transaction is valid

      if (dryWriteResults?.type === 'error') {
        throw new Error(
          `Contract interaction detected to be invalid: ${
            dryWriteResults?.originalErrorMessages
              ? Object.entries(dryWriteResults?.originalErrorMessages)
                  .map(([name, errorMessage]) => `${name}: ${errorMessage}`)
                  .join(',')
              : dryWriteResults?.errorMessage
          }`,
        );
      }
    }

    const result = useUnsafe
      ? await this.unsafeWriteTransaction({ contractTxId, payload }).then(
          (id: ArweaveTransactionID) => ({ originalTxId: id.toString() }),
        )
      : await withExponentialBackoff<WriteInteractionResponse | null>({
          fn: () =>
            contract
              .writeInteraction(payload, {
                disableBundling: true,
                tags: tags,
              })
              .catch((error) => error),
          shouldRetry: (result, attempt, nextAttemptMs) => {
            if (result instanceof Error) {
              eventEmitter.emit(
                'error',
                new ContractInteractionError(
                  `Write interaction failed for contract ${contractTxId.toString()} with error: ${
                    result.message
                  }. Retrying in ${nextAttemptMs / 1000} seconds...`,
                ),
              );
              return true;
            }
            return false;
          },
          maxTries: 3,
          initialDelay: 1000,
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
      ...(interactionDetails ?? {}),
    });

    return new ArweaveTransactionID(originalTxId);
  }

  async deployContract({
    walletAddress,
    srcCodeTransactionId,
    initialState,
    tags = [],
    interactionDetails,
  }: {
    walletAddress: ArweaveTransactionID;
    srcCodeTransactionId: ArweaveTransactionID;
    initialState: ANTContractJSON;
    tags?: Tags;
    interactionDetails?: Record<string, any>;
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
      wallet: ArWallet | CustomSignature;
      initState: string;
      srcTxId: string;
      tags: Tags;
    } = {
      wallet: this._walletConnector.signer,
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
        ...(interactionDetails ?? {}),
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
    isBid,
  }: {
    walletAddress: ArweaveTransactionID;
    registryId: ArweaveTransactionID;
    srcCodeTransactionId: ArweaveTransactionID;
    initialState: ANTContractJSON;
    domain: string;
    type: TRANSACTION_TYPES;
    years?: number;
    auction: boolean;
    qty: number;
    isBid: boolean;
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

    const { evaluationOptions = {} } = await this.getContractManifest({
      contractTxId: registryId,
    });

    const contract = await this._warp
      .contract(ARNS_REGISTRY_ADDRESS.toString())
      .setEvaluationOptions(evaluationOptions)
      .connect(this._walletConnector.signer)
      // TODO: add to our SmartweaveContractInterface a method that gets the full response of the service with `sortKey`
      .syncState(`${ARNS_SERVICE_API}/v1/contract/${ARNS_REGISTRY_ADDRESS}`);

    // because we are manually constructing the tags, we want to verify them immediately and always
    const dryWriteResults = await this.dryWrite({
      walletAddress,
      contract,
      payload: input,
    }).catch((e) => {
      console.error(e);
      eventEmitter.emit('error', e);
    });
    // an undefined valid means the transaction is valid
    // it is possible for dryWrite to fail (warp will break) which we catch and deploy the contract + interaction anyway, which is already done "unsafely"
    if (dryWriteResults?.type === 'error') {
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
      interactionDetails: { isBid },
    });
    if (!result) {
      throw new Error('Could not deploy atomic contract');
    }
    return result;
  }

  async dryWrite({
    walletAddress,
    contract,
    payload,
  }: {
    walletAddress: ArweaveTransactionID;
    contract: Contract<any>;
    payload: {
      function: string;
      [x: string]: any;
    };
  }): Promise<InteractionResult<any, any> | undefined> {
    const dryWriteResults = async () => {
      return await contract
        .dryWrite(payload, walletAddress.toString())
        .catch((e) => e);
    };

    const results = await withExponentialBackoff<InteractionResult<any, any>>({
      fn: dryWriteResults,
      shouldRetry: (res, attempt, nextAttemptMs) => {
        /**
         * case for retry example: https://permanent-data-solutions-e7.sentry.io/issues/4577680450/?alert_rule_id=14289185&alert_type=issue&notification_uuid=bbbf62a0-1317-439d-9079-5bfce0286d10&project=4504894571085824&referrer=slack
         */
        if (res instanceof Error) {
          eventEmitter.emit(
            'error',
            new ContractInteractionError(
              `Dry Write failed for contract ${contract.txId()} with error: ${
                res.message
              } on attempt ${attempt}. Retrying in ${
                nextAttemptMs / 1000
              } seconds.`,
            ),
          );
          return true;
        }
        return false;
      },
      maxTries: 3,
      initialDelay: 30 * 1000, // total try period 3.5 minutes max
    });

    return results;
  }

  async unsafeWriteTransaction({
    contractTxId,
    payload,
    data,
    tags = [],
  }: {
    contractTxId: ArweaveTransactionID;
    payload: {
      function: string;
      [x: string]: any;
    };
    data?: string | Uint8Array;
    tags?: Tags;
  }): Promise<ArweaveTransactionID> {
    const interactionTags = buildSmartweaveInteractionTags({
      contractId: contractTxId,
      input: payload,
    });
    const transaction = await this._arweave.createTransaction(
      {
        data,
      },
      'use_wallet',
    );
    [...interactionTags, ...tags].forEach((tag) => {
      transaction.addTag(tag.name, tag.value);
    });
    await this._arweave.transactions.sign(transaction, 'use_wallet');
    const response = await withExponentialBackoff<ArweaveTransactionID | null>({
      fn: () =>
        this._arweave.transactions
          .post(transaction)
          .then((response) => response)
          .catch((error) => error),
      shouldRetry: (result) => {
        if (result instanceof Response && result.status > 300) {
          return false;
        } else {
          return true;
        }
      },
      maxTries: 5,
      initialDelay: 100,
    });
    if (!response) {
      throw Error('No result from write interaction');
    }
    return new ArweaveTransactionID(transaction.id);
  }
}
