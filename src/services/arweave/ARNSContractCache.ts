import { ArNSServiceError } from '@src/utils/errors';
import fetchRetry from 'fetch-retry';
import { chunk } from 'lodash';

import {
  ANTContractDomainRecord,
  ANTContractJSON,
  ARNSContractJSON,
  ARNSRecordEntry,
  ArweaveDataProvider,
  Auction,
  AuctionSettings,
  ContractInteraction,
  INTERACTION_PRICE_PARAMS,
  KVCache,
  SmartweaveContractCache,
  TransactionCache,
} from '../../types';
import {
  buildPendingANTRecord,
  buildPendingArNSRecord,
  isArweaveTransactionID,
  isDomainReservedLength,
  lowerCaseDomain,
  mioToIo,
} from '../../utils';
import {
  ARNS_REGISTRY_ADDRESS,
  ARWEAVE_TX_LENGTH,
} from '../../utils/constants';
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
  }: {
    url: string;
    arweave: ArweaveDataProvider;
    cache?: TransactionCache & KVCache;
    http?: any;
  }) {
    this._url = url;
    this._cache = cache;
    this._arweave = arweave;
    this._http = http;
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
    contractTxId: ArweaveTransactionID,
    wallet: ArweaveTransactionID,
  ): Promise<number> {
    const res = await this._http(
      `${
        this._url
      }/v1/contract/${contractTxId.toString()}/balances/${wallet.toString()}`,
    );
    const { balance } = await res.json();
    return mioToIo(+balance) ?? 0;
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
    contractTxId = ARNS_REGISTRY_ADDRESS,
  }: {
    domain: string;
    contractTxId: ArweaveTransactionID;
  }): Promise<boolean> {
    const res = await this._http(
      `${
        this._url
      }/v1/contract/${contractTxId.toString()}/reserved/${lowerCaseDomain(
        domain,
      )}`,
    );
    const { reserved } = await res.json();
    if (reserved === undefined) {
      throw new Error('Error checking if domain is reserved');
    }

    const isReserved = reserved || isDomainReservedLength(domain);
    return isReserved;
  }

  async isDomainInAuction({
    contractTxId,
    domain,
    type = 'lease',
  }: {
    contractTxId: ArweaveTransactionID;
    domain: string;
    type: 'lease' | 'permabuy';
  }): Promise<boolean> {
    return this.getAuction({ contractTxId, domain, type })
      .then((auction: Auction) => auction.isActive)
      .catch((e) => {
        console.error(e);
        return false;
      });
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

  async getAuction({
    contractTxId,
    domain,
    type,
  }: {
    contractTxId: ArweaveTransactionID;
    domain: string;
    type?: 'lease' | 'permabuy';
  }): Promise<Auction> {
    const cachedInteractions = await this._cache.getCachedInteractions(
      contractTxId,
    );
    const cachedAuction = cachedInteractions
      .filter((interaction: ContractInteraction) => {
        if (
          interaction.payload?.name === domain &&
          interaction.payload?.auction === true
        ) {
          return {
            ...interaction,
            payload: {
              ...interaction.payload,
              contractTxId: interaction.id.toString(),
              initiator: interaction.deployer,
            },
          };
        }
      })
      .sort((a, b) => +b.timestamp - +a.timestamp)[0];

    const urlParams =
      type || cachedAuction?.payload?.type
        ? new URLSearchParams({
            type: type ?? cachedAuction!.payload?.type.toString(),
          })
        : '';

    const auctionRes = await this._http(
      `${
        this._url
      }/v1/contract/${contractTxId.toString()}/auctions/${domain}?${urlParams.toString()}`,
    ).catch(() => undefined);
    const { result: auction } =
      auctionRes && auctionRes.ok
        ? await auctionRes.json()
        : { result: undefined };

    if (!auction) {
      throw new Error(
        `Failed to get auction for ${domain} on contract ${contractTxId.toString()}`,
      );
    }

    const res = {
      ...auction,
      ...(cachedAuction?.payload
        ? {
            ...cachedAuction.payload,
            currentPrice: auction.startPrice,
            isActive: !cachedAuction?.isBid,
            initiator: cachedAuction.deployer,
          }
        : {}),
    };
    res.currentPrice = mioToIo(res.currentPrice);
    res.floorPrice = mioToIo(res.floorPrice);
    res.startPrice = mioToIo(res.startPrice);
    res.prices = Object.entries(res.prices)
      .map(([blockheight, price]) => {
        return [blockheight, mioToIo(price as number)];
      })
      .reduce((acc: Record<number, number>, [blockheight, price]) => {
        acc[blockheight as number] = price as number;
        return acc;
      }, {});

    return res;
  }

  async getAuctionSettings({
    contractTxId,
  }: {
    contractTxId: ArweaveTransactionID;
  }): Promise<AuctionSettings> {
    const res = await this._http(
      `${this._url}/v1/contract/${contractTxId.toString()}/settings`,
    );
    const { settings } = await res.json();
    const { auctions } = settings;
    if (!auctions) {
      throw new Error(
        `Auction settings not found for contract ${contractTxId.toString()}`,
      );
    }
    return auctions;
  }

  async getDomainsInAuction({
    address,
    contractTxId,
  }: {
    address?: ArweaveTransactionID;
    contractTxId: ArweaveTransactionID;
  }): Promise<string[]> {
    const res = await this._http(
      `${this._url}/v1/contract/${contractTxId.toString()}/auctions`,
    );
    const { auctions } = await res.json();
    const domainsInAuction = new Set(Object.keys(auctions));

    if (address) {
      const cachedInteractions = await this._cache.getCachedInteractions(
        contractTxId,
      );
      cachedInteractions.forEach((interaction: any) => {
        if (
          interaction.payload?.auction === true &&
          interaction.deployer === address.toString() &&
          !domainsInAuction.has(interaction.payload.name)
        ) {
          domainsInAuction.add(interaction.payload.name);
        }
      });
    }
    return [...domainsInAuction];
  }

  async getRecord({
    domain,
    contractTxId = ARNS_REGISTRY_ADDRESS,
  }: {
    domain: string;
    contractTxId: ArweaveTransactionID;
  }): Promise<ARNSRecordEntry> {
    const res = await this._http(
      `${
        this._url
      }/v1/contract/${contractTxId.toString()}/records/${lowerCaseDomain(
        domain,
      )}`,
    ).catch(() => undefined);
    const { record } = res && res.ok ? await res.json() : { record: undefined };

    const cachedInteractions = await this._cache.getCachedInteractions(
      contractTxId,
    );

    const cachedRecords = cachedInteractions.filter(
      (interaction: ContractInteraction) =>
        interaction.payload?.name === domain &&
        interaction.payload?.function === 'buyRecord',
    );
    // its possible for their to be multiple interactions because of bid and auction initialization so we need to get the most recent one.
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
    // check if cached record is an auction bid
    const auction = cachedRecord?.payload.auction
      ? await this.getAuction({
          contractTxId,
          domain,
        })
      : undefined;
    if ((cachedRecord && !auction) || cachedRecord?.isBid) {
      return buildPendingArNSRecord(cachedRecord);
    }
    throw new Error('Error getting record');
  }

  async getRecords<T extends ARNSRecordEntry | ANTContractDomainRecord>({
    contractTxId = ARNS_REGISTRY_ADDRESS,
    filters,
  }: {
    contractTxId?: ArweaveTransactionID;

    filters: {
      contractTxId?: ArweaveTransactionID[];
    };
  }): Promise<{ [x: string]: T }> {
    const cachedInteractions = await this._cache
      .getCachedInteractions(contractTxId)
      .then((interactions) =>
        interactions.filter(
          (interaction: ContractInteraction) =>
            interaction.payload.function ===
              (contractTxId.toString() === ARNS_REGISTRY_ADDRESS.toString()
                ? 'buyRecord'
                : 'setRecord') && !interaction.payload?.auction,
        ),
      );

    // TODO: this doesn't extend well, but allows multiple contractTxIds to be passed in
    // We'd want to create an array for any key that can be an array and then add it to the
    // array of [key, value]'s provided to URLSearchParams

    /* NOTE: max url size is 2047, so need to be careful about how many contractTxIds are passed in and chunk accordingly.
     * no parsing currently needed as only contractTxId is passed in and it is a string, but for other requests we may need to parse for safe url params
     */
    const contractTxIdSet = new Set([
      ...(filters?.contractTxId
        ? filters.contractTxId.map((id) => id.toString())
        : []),
    ]); // dedupe to reduce query size
    const baseUrl = `${
      this._url
    }/v1/contract/${contractTxId.toString()}/records?`;
    const urlMaxLength = 2047;
    const urlParamSpace = urlMaxLength - baseUrl.length;
    const paramLength = '&contractTxId='.length + ARWEAVE_TX_LENGTH;
    const batchSize = Math.floor(urlParamSpace / paramLength);
    const contractTxIdBatches = chunk([...contractTxIdSet], batchSize);
    const urlQueryParamBatches = contractTxIdBatches.map((batch) => {
      const urlQueryParams = new URLSearchParams(
        batch.map((id) => ['contractTxId', id.toString()]),
      );
      return urlQueryParams.toString();
    });

    const results: { [x: string]: T } = {};
    await Promise.all(
      urlQueryParamBatches.map(async (urlQueryParams) => {
        const { records } = await this._http(
          `${baseUrl}${urlQueryParams.toString()}`,
        ).then(async (res: Response) => await res.json());
        for (const [key, value] of Object.entries(records)) {
          results[key] = value as any;
        }
      }),
    ).catch((e) => {
      throw new ArNSServiceError(e.message);
    });

    const domains = Object.keys(results ?? {});

    const cachedRegistrations = cachedInteractions.reduce(
      (acc: Record<string, T>, interaction: ContractInteraction) => {
        if (domains.includes(interaction.payload.name.toString())) {
          this._cache.del(contractTxId.toString(), {
            key: 'id',
            value: interaction.id,
          });
        } else if (contractTxId === ARNS_REGISTRY_ADDRESS) {
          // arns specific entry
          const domainName = interaction.payload.name as string;
          acc[domainName] = buildPendingArNSRecord(interaction) as T;
        } else {
          const subdomain = interaction.payload.subdomain as string;
          // ant specific entry
          acc[subdomain] = buildPendingANTRecord(interaction) as T;
        }

        return acc;
      },
      {},
    );
    return { ...cachedRegistrations, ...results };
  }

  async getTokenBalance(
    address: ArweaveTransactionID,
    contractTxId: ArweaveTransactionID,
  ): Promise<number> {
    const res = await this._http(
      `${
        this._url
      }/v1/contract/${contractTxId.toString()}/balances/${address.toString()}`,
    ).catch(() => undefined);

    const { balance } =
      res && res.ok ? await res.json() : { balance: undefined };

    const cachedRegistryInteractions = await this._cache.getCachedInteractions(
      ARNS_REGISTRY_ADDRESS,
    );

    const cachedBalance = cachedRegistryInteractions
      .filter((interaction) => interaction.payload.qty)
      .reduce((acc, interaction) => acc + +interaction.payload.qty, 0);

    return mioToIo(balance - cachedBalance);
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
