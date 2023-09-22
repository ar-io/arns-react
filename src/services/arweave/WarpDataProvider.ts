import Arweave from 'arweave/node/common';
import {
  ArWallet,
  LoggerFactory,
  Warp,
  WarpFactory,
  WriteInteractionResponse,
  defaultCacheOptions,
} from 'warp-contracts';
import { DeployPlugin } from 'warp-contracts-plugin-deploy';

import {
  ArweaveTransactionID,
  Auction,
  AuctionParameters,
  AuctionSettings,
  ContractInteraction,
  PDNSContractJSON,
  PDNSRecordEntry,
  PDNTContractJSON,
  SmartweaveContractCache,
  SmartweaveContractInteractionProvider,
  TRANSACTION_TYPES,
  TransactionCache,
  TransactionTag,
} from '../../types';
import {
  buildSmartweaveInteractionTags,
  byteSize,
  isDomainAuctionable,
  isDomainReservedLength,
  isPDNSDomainNameValid,
  lowerCaseDomain,
  withExponentialBackoff,
} from '../../utils';
import {
  ATOMIC_REGISTRATION_INPUT,
  PDNS_REGISTRY_ADDRESS,
  SMARTWEAVE_MAX_TAG_SPACE,
} from '../../utils/constants';
import { LocalStorageCache } from '../cache/LocalStorageCache';
import { PDNTContract } from './PDNTContract';

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
    const contract = this._warp.contract(id.toString()).setEvaluationOptions({
      waitForConfirmation: true,
      internalWrites: true,
      updateCacheForEachInteraction: true,
      unsafeClient: 'skip',
      maxCallDepth: 3,
    });
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
    tags: TransactionTag[];
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
        contractTxId.toString() === PDNS_REGISTRY_ADDRESS
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
  }: {
    walletAddress: ArweaveTransactionID;
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
    type,
    years,
    reservedList,
  }: {
    walletAddress: ArweaveTransactionID;
    registryId: ArweaveTransactionID;
    srcCodeTransactionId: ArweaveTransactionID;
    initialState: PDNTContractJSON;
    domain: string;
    type: TRANSACTION_TYPES;
    years?: number;
    reservedList: string[];
  }): Promise<string | undefined> {
    if (!domain) {
      throw new Error('No domain provided');
    }

    const input = {
      ...ATOMIC_REGISTRATION_INPUT,
      name: domain,
      type,
      years,
      auction: isDomainAuctionable({
        domain,
        registrationType: type,
        reservedList,
      }),
    };
    const tags = buildSmartweaveInteractionTags({
      contractId: registryId,
      input,
    });

    const contract = this._warp // eval options were required due to change in manifest. This is causing an issue where it is causing a delay for returning the txid due to the `waitForConfirmation` option. This should be removed from the eval manifest if we dont want to make the user wait.
      .contract(PDNS_REGISTRY_ADDRESS)
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

  /* eslint-disable */
  async getContractsForWallet(
    address: ArweaveTransactionID,
  ): Promise<{ contractTxIds: ArweaveTransactionID[] }> {
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
  async getCachedNameTokens(
    address: ArweaveTransactionID,
  ): Promise<PDNTContract[]> {
    throw Error('Not implemented');
  }

  async getAuction(domain: string): Promise<AuctionParameters> {
    throw Error('Not implemented');
  }
  async getAuctionSettings(id: string): Promise<AuctionSettings> {
    throw Error('Not implemented');
  }
  /* eslint-enable */

  async isDomainReserved({ domain }: { domain: string }): Promise<boolean> {
    const reservedList = await this.getContractState<PDNSContractJSON>(
      new ArweaveTransactionID(PDNS_REGISTRY_ADDRESS),
    ).then((state) => Object.keys(state.reserved));
    return (
      reservedList.includes(lowerCaseDomain(domain)) ||
      isDomainReservedLength(domain)
    );
  }

  isDomainInAuction({
    domain,
    auctionsList,
  }: {
    domain: string;
    auctionsList: string[];
  }): boolean {
    return auctionsList.includes(lowerCaseDomain(domain));
  }

  async isDomainAvailable({ domain }: { domain: string }): Promise<boolean> {
    const domainsList = await this.getContractState<PDNSContractJSON>(
      new ArweaveTransactionID(PDNS_REGISTRY_ADDRESS),
    ).then((state) => Object.keys(state.records));
    return !domainsList.includes(lowerCaseDomain(domain));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAuctionPrices(
    domain: string,
    currentBlockHeight: number,
  ): Promise<Auction> {
    if (!domain.length) {
      throw new Error('No domain provided');
    }
    if (!isPDNSDomainNameValid({ name: domain })) {
      throw new Error('Invalid domain name');
    }
    const { result } = (await this._warp
      .contract(PDNS_REGISTRY_ADDRESS)
      .setEvaluationOptions({
        waitForConfirmation: true,
        internalWrites: true,
        updateCacheForEachInteraction: true,
        unsafeClient: 'skip',
        maxCallDepth: 3,
      })
      .viewState({
        function: 'auction',
        name: lowerCaseDomain(domain),
      })) as unknown as any;

    if (!result) {
      throw new Error(
        `Unable to read auction info from contract for ${domain}`,
      );
    }

    const { settings, ...auction } = result.auction;
    // return the first price that is less than the current block height
    const priceKey = Object.keys(auction.prices).find((key, index) => {
      if (+key <= currentBlockHeight) {
        return index;
      }
    });
    return {
      ...settings,
      ...auction,
      minimumAuctionBid: auction.prices[priceKey!],
    } as Auction;
  }

  async getDomainsInAuction(): Promise<string[]> {
    // todo: make this a read action on the contract
    const state = await this.getContractState<PDNSContractJSON>(
      new ArweaveTransactionID(PDNS_REGISTRY_ADDRESS),
    );

    if (!state || !state.auctions) {
      throw new Error('Unable to read auction info from contract');
    }
    const auctionsList = Object.keys(state.auctions);

    return auctionsList;
  }

  async getRecord(domain: string): Promise<PDNSRecordEntry> {
    const state = await this.getContractState<PDNSContractJSON>(
      new ArweaveTransactionID(PDNS_REGISTRY_ADDRESS),
    );

    if (!state?.records) {
      throw new Error('Unable to read record info from contract');
    }

    return state.records[lowerCaseDomain(domain)];
  }

  async getIoBalance(address: ArweaveTransactionID): Promise<number> {
    const state = await this.getContractState<PDNSContractJSON>(
      new ArweaveTransactionID(PDNS_REGISTRY_ADDRESS),
    );

    if (!state?.balances) {
      throw new Error('Unable to read balance info from contract');
    }

    return state.balances[address.toString()];
  }
}
