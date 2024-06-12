import {
  ArIO,
  ArIOReadable,
  ArIOWritable,
  ArNSNameData,
  mIOToken,
} from '@ar.io/sdk/web';
import fetchRetry from 'fetch-retry';

import {
  ANTContractJSON,
  ARNSContractJSON,
  ARNSDomains,
  ArweaveDataProvider,
  ContractInteraction,
  INTERACTION_PRICE_PARAMS,
  KVCache,
  SmartweaveContractCache,
  TransactionCache,
} from '../../types';
import {
  buildPendingArNSRecord,
  isArweaveTransactionID,
  isDomainReservedLength,
  mioToIo,
} from '../../utils';
import { ARNS_REGISTRY_ADDRESS } from '../../utils/constants';
import { ContractInteractionCache } from '../caches/ContractInteractionCache';
import { LocalStorageCache } from '../caches/LocalStorageCache';
import { ANTContract } from './ANTContract';
import { ArweaveTransactionID } from './ArweaveTransactionID';

const NO_RETRY_HTTP_STATUS_CODES = new Set([404]);

export class ARNSContractCache implements SmartweaveContractCache {
  protected _url: string;
  protected _cache: TransactionCache & KVCache;
  protected _arweave: ArweaveDataProvider;
  protected _http;
  protected _arioContract: ArIOReadable | ArIOWritable;

  constructor({
    url,
    arweave,
    cache = new ContractInteractionCache(new LocalStorageCache()),
    http = fetchRetry(fetch, {
      retryOn: (attempt, error, response) => {
        if (attempt > 3) return false;
        if (
          error !== null ||
          (response &&
            response.status >= 400 &&
            !NO_RETRY_HTTP_STATUS_CODES.has(response.status))
        ) {
          console.debug(`Retrying request, attempt number ${attempt + 1}`);
          return true;
        }
        return false;
      },
      retryDelay: (attempt) => {
        return Math.pow(2, attempt) * 500; // 500, 1000, 2000
      },
    }),
    arioContract = ArIO.init({
      contractTxId: ARNS_REGISTRY_ADDRESS.toString(),
    }),
  }: {
    url: string;
    arweave: ArweaveDataProvider;
    cache?: TransactionCache & KVCache;
    http?: any;
    arioContract?: ArIOReadable | ArIOWritable;
  }) {
    this._url = url;
    this._cache = cache;
    this._arweave = arweave;
    this._http = http;
    this._arioContract = arioContract;
  }

  async getContractState<T extends ANTContractJSON | ARNSContractJSON>(
    contractTxId: ArweaveTransactionID,
  ): Promise<T> {
    // if we have pending interactions, manipulate state based on their payloads (map function names to state keys and apply payloads)

    // atticus opinion: implement state manipulation in ANTContract class and ArNSRegistry contract class which implements this getContractState method and
    // adds cached interactions.

    try {
      const res = await this._http(
        `${this._url}/v1/contract/${contractTxId.toString()}`,
      );
      const { state } = res && res.ok ? await res.json() : { state: undefined };

      const cachedTokens = await this._cache.getCachedNameTokens();
      const cachedToken = cachedTokens?.find(
        (token: ANTContract) =>
          token.id?.toString() === contractTxId.toString(),
      );
      const cachedInteractions = await this._cache.getCachedInteractions(
        contractTxId,
      );
      if (cachedInteractions) {
        cachedInteractions.map((interaction: ContractInteraction) => {
          if (state && interaction.type === 'deploy') {
            this._cache.del(contractTxId.toString(), {
              key: 'id',
              value: interaction.id,
            });
          }
        });
      }

      if (cachedToken && !state) {
        return cachedToken.state as T;
      }

      return state as T;
    } catch (error) {
      console.error(error);
      return {} as T;
    }
  }
  // TODO: replace with ArIO sdk implementation
  async getContractBalanceForWallet(
    wallet: ArweaveTransactionID,
  ): Promise<number> {
    return await this._arioContract
      .getBalance({
        address: wallet.toString(),
      })
      .then((b) => new mIOToken(b).toIO().valueOf());
  }

  async getContractsForWallet(
    address: ArweaveTransactionID,
    type?: 'ant',
  ): Promise<{ contractTxIds: ArweaveTransactionID[] }> {
    const query = type ? `?type=${type}` : '';
    const res = await this._http(
      `${this._url}/v1/wallet/${address.toString()}/contracts${query}`,
    );
    const { contractTxIds } = await res.json();
    const ids = new Set<string>(contractTxIds);
    const cachedTokens = await this._cache.getCachedNameTokens(address);
    cachedTokens.forEach((token) => {
      if (token.id && isArweaveTransactionID(token.id.toString())) {
        ids.add(token.id?.toString());
      }
    });

    return {
      contractTxIds: [...ids].map((id: string) => new ArweaveTransactionID(id)),
    };
  }

  async getContractInteractions(
    contractTxId: ArweaveTransactionID,
  ): Promise<ContractInteraction[]> {
    const res = await this._http(
      `${this._url}/v1/contract/${contractTxId.toString()}/interactions?page=1`,
    );
    // TODO: implement pagination and selective page query
    const { interactions } = await res.json();
    return interactions;
  }

  async getPendingContractInteractions(
    contractTxId: ArweaveTransactionID,
  ): Promise<ContractInteraction[]> {
    const cachedInteractions = await this._cache.getCachedInteractions(
      contractTxId,
    );

    if (!cachedInteractions.length) {
      return [];
    }

    const gqlIndexedInteractions = await this.getContractInteractions(
      contractTxId,
    );
    const pendingInteractions = cachedInteractions.filter(
      (interaction) =>
        !gqlIndexedInteractions.find(
          (gqlInteraction: ContractInteraction) =>
            gqlInteraction.id === interaction.id,
        ),
    );

    // update the cache to remove indexed transactions for
    this._cache.set(contractTxId.toString(), pendingInteractions);

    // return only the ones relevant to the specified contract
    return pendingInteractions.filter(
      (interaction) => interaction.contractTxId === contractTxId.toString(),
    );
  }
  // TODO: implement arns service query for the following 3 functions
  async isDomainReserved({
    domain,
  }: {
    domain: string;
  }): Promise<{ isReserved: boolean; reservedFor?: string }> {
    const reservedData = await this._arioContract.getArNSReservedName({
      domain,
    });

    const isReserved = !!reservedData || isDomainReservedLength(domain);
    return {
      isReserved,
      reservedFor: reservedData && reservedData.target,
    };
  }

  async isDomainAvailable({
    domain,
    contractTxId = ARNS_REGISTRY_ADDRESS,
  }: {
    domain: string;
    contractTxId: ArweaveTransactionID;
  }): Promise<boolean> {
    const domainRecord = await this.getRecord({
      domain,
      contractTxId,
    }).catch(() => undefined);
    if (domainRecord) {
      return false;
    }
    return true;
  }

  async getRecord({
    domain,
    contractTxId = ARNS_REGISTRY_ADDRESS,
  }: {
    domain: string;
    contractTxId: ArweaveTransactionID;
  }): Promise<ArNSNameData> {
    const record = await this._arioContract.getArNSRecord({
      domain,
    });

    const cachedInteractions = await this._cache.getCachedInteractions(
      contractTxId,
    );

    const cachedRecords = cachedInteractions.filter(
      (interaction: ContractInteraction) =>
        interaction.payload?.name === domain &&
        interaction.payload?.function === 'buyRecord',
    );
    const cachedRecord = cachedRecords.sort(
      (a, b) => +b.timestamp - +a.timestamp,
    )[0];
    if (record !== undefined) {
      if (cachedRecord) {
        await this._cache.del(contractTxId.toString(), {
          key: 'id',
          value: cachedRecord.id,
        });
      }
      return record;
    }
    // check if cached record
    if (cachedRecord) {
      return buildPendingArNSRecord(cachedRecord);
    }
    throw new Error('Error getting record');
  }

  async getRecords({
    contractTxId = ARNS_REGISTRY_ADDRESS,
    filters,
  }: {
    contractTxId?: ArweaveTransactionID;

    filters: {
      contractTxId?: ArweaveTransactionID[];
    };
  }): Promise<ARNSDomains> {
    const cachedInteractions = await this._cache
      .getCachedInteractions(contractTxId)
      .then((interactions) =>
        interactions.filter(
          (interaction: ContractInteraction) =>
            interaction.payload.function ===
            (contractTxId.toString() === ARNS_REGISTRY_ADDRESS.toString()
              ? 'buyRecord'
              : 'setRecord'),
        ),
      );

    const contractTxIdSet = new Set([
      ...(filters?.contractTxId?.map((id) => id.toString()) ?? []),
    ]);

    const records = Object.entries(
      (await this._arioContract.getArNSRecords()) as Record<
        string,
        ArNSNameData
      >,
    );

    const results = records.reduce((acc: ARNSDomains, [domain, record]) => {
      if (contractTxIdSet.has(record.contractTxId.toString())) {
        return { ...acc, [domain]: record };
      }
      return acc;
    }, {});

    const domains = Object.keys(results);

    const cachedRegistrations = cachedInteractions.reduce(
      (acc: ARNSDomains, interaction: ContractInteraction) => {
        if (domains.includes(interaction.payload.name.toString())) {
          this._cache.del(contractTxId.toString(), {
            key: 'id',
            value: interaction.id,
          });
        } else if (contractTxId === ARNS_REGISTRY_ADDRESS) {
          return {
            ...acc,
            [interaction.payload.name as string]:
              buildPendingArNSRecord(interaction),
          };
        }

        return acc;
      },
      {},
    );
    return { ...cachedRegistrations, ...results };
  }

  async getTokenBalance(address: ArweaveTransactionID): Promise<number> {
    const balance = await this._arioContract.getBalance({
      address: address.toString(),
    });
    const cachedRegistryInteractions = await this._cache.getCachedInteractions(
      ARNS_REGISTRY_ADDRESS,
    );

    const cachedBalance = cachedRegistryInteractions
      .filter((interaction) => interaction.payload.qty)
      .reduce((acc, interaction) => acc + +interaction.payload.qty, 0);

    return new mIOToken(balance - cachedBalance).toIO().valueOf();
  }

  async getPriceForInteraction(
    { interactionName, payload }: INTERACTION_PRICE_PARAMS,
    contractTxId: ArweaveTransactionID,
  ): Promise<number> {
    const params = new URLSearchParams(
      Object.entries({
        interactionName: interactionName,
        ...payload,
      }).map(([key, value]) => [key, value.toString()]),
    );

    const res = await this._http(
      `${
        this._url
      }/v1/contract/${contractTxId.toString()}/read/priceForInteraction?${params.toString()}`,
    ).catch(() => undefined);

    const {
      result: { price },
    } = res && res.ok ? await res.json() : { result: { price: undefined } };

    if (!price) {
      throw new Error(`Couldn't get price for ${interactionName}`);
    }

    return mioToIo(price);
  }
  async buildANTContract(
    contractTxId: ArweaveTransactionID,
  ): Promise<ANTContract> {
    const [state, pendingInteractions] = await Promise.all([
      this.getContractState<ANTContractJSON>(contractTxId),
      this.getPendingContractInteractions(contractTxId),
    ]);
    return new ANTContract(state, contractTxId, pendingInteractions);
  }
  async getStateField({
    contractTxId,
    field,
  }: {
    contractTxId: ArweaveTransactionID;
    field: string;
  }) {
    const res = await this._http(
      `${this._url}/v1/contract/${contractTxId.toString()}/${field}`,
    );
    const result = await res.json();
    return result[field];
  }
}
