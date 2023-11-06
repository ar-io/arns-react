import { isArray } from 'lodash';

import {
  ArweaveDataProvider,
  ArweaveTransactionID,
  Auction,
  AuctionSettings,
  ContractInteraction,
  KVCache,
  PDNSContractJSON,
  PDNSRecordEntry,
  PDNTContractDomainRecord,
  PDNTContractJSON,
  SmartweaveContractCache,
  TransactionCache,
} from '../../types';
import {
  buildPendingANTRecord,
  buildPendingArNSRecord,
  isArweaveTransactionID,
  isDomainReservedLength,
  lowerCaseDomain,
} from '../../utils';
import { ARNS_REGISTRY_ADDRESS } from '../../utils/constants';
import { ContractInteractionCache } from '../caches/ContractInteractionCache';
import { LocalStorageCache } from '../caches/LocalStorageCache';
import { PDNTContract } from './PDNTContract';

export class PDNSContractCache implements SmartweaveContractCache {
  protected _url: string;
  protected _cache: TransactionCache & KVCache;
  protected _arweave: ArweaveDataProvider;

  constructor({
    url,
    arweave,
    cache = new ContractInteractionCache(new LocalStorageCache()),
  }: {
    url: string;
    arweave: ArweaveDataProvider;
    cache?: TransactionCache & KVCache;
  }) {
    this._url = url;
    this._cache = cache;
    this._arweave = arweave;
  }

  async getContractState<T extends PDNTContractJSON | PDNSContractJSON>(
    contractTxId: ArweaveTransactionID,
  ): Promise<T> {
    // if we have pending interactions, manipulate state based on their payloads (map function names to state keys and apply payloads)

    // atticus opinion: implement state manipulation in PDNTContract class and ArNSRegistry contract class which implements this getContractState method and
    // adds cached interactions.

    try {
      const res = await fetch(
        `${this._url}/v1/contract/${contractTxId.toString()}`,
      );
      const { state } = res && res.ok ? await res.json() : { state: undefined };

      const cachedTokens = this._cache.getCachedNameTokens();
      const cachedToken = cachedTokens?.find(
        (token: PDNTContract) =>
          token.id?.toString() === contractTxId.toString(),
      );
      const cachedInteractions =
        this._cache.getCachedInteractions(contractTxId);
      if (cachedInteractions) {
        await Promise.all(
          cachedInteractions.map(async (interaction: ContractInteraction) => {
            const interactionStatus = await this._arweave
              .getTransactionStatus(new ArweaveTransactionID(interaction.id))
              .catch(() => {
                console.error(
                  'Error getting transaction status for',
                  interaction.id,
                );
                return {} as Record<string, boolean>;
              });
            if (interactionStatus[interaction.id]) {
              this._cache.del(contractTxId.toString(), {
                key: 'id',
                value: interaction.id,
              });
            }
          }),
        );
      }

      if (cachedToken && !state) {
        return cachedToken.state as T;
      }
      if (state && cachedToken) {
        this._cache.del(contractTxId.toString());
      }

      return state as T;
    } catch (error) {
      console.error(error);
      return {} as T;
    }
  }

  async getContractBalanceForWallet(
    contractTxId: ArweaveTransactionID,
    wallet: ArweaveTransactionID,
  ): Promise<number> {
    const res = await fetch(
      `${
        this._url
      }/v1/contract/${contractTxId.toString()}/balances/${wallet.toString()}`,
    );
    const { balance } = await res.json();
    return +balance ?? 0;
  }

  async getContractsForWallet(
    address: ArweaveTransactionID,
    type?: 'ant',
  ): Promise<{ contractTxIds: ArweaveTransactionID[] }> {
    const query = type ? `?type=${type}` : '';
    const res = await fetch(
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
    const res = await fetch(
      `${this._url}/v1/contract/${contractTxId.toString()}/interactions`,
    );
    const { interactions } = await res.json();
    return interactions;
  }

  async getPendingContractInteractions(
    contractTxId: ArweaveTransactionID,
    key: string,
  ): Promise<ContractInteraction[]> {
    const cachedInteractions = this._cache.getCachedInteractions(contractTxId);

    if (!isArray(cachedInteractions) || !cachedInteractions.length) {
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
    this._cache.set(key, pendingInteractions);

    // return only the ones relevant to the specified contract
    return pendingInteractions.filter(
      (interaction) => interaction.contractTxId === contractTxId.toString(),
    );
  }
  // TODO: implement arns service query for the following 3 functions
  async isDomainReserved({
    domain,
    contractTxId = new ArweaveTransactionID(ARNS_REGISTRY_ADDRESS),
  }: {
    domain: string;
    contractTxId: ArweaveTransactionID;
  }): Promise<boolean> {
    const res = await fetch(
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
    contractTxId = new ArweaveTransactionID(ARNS_REGISTRY_ADDRESS),
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

    const auctionRes = await fetch(
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
            minimumBid: auction.startPrice,
            isActive: !cachedAuction?.isBid,
            initiator: cachedAuction.deployer,
          }
        : {}),
    };
    return res;
  }

  async getAuctionSettings({
    contractTxId,
  }: {
    contractTxId: ArweaveTransactionID;
  }): Promise<AuctionSettings> {
    const res = await fetch(
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
    const res = await fetch(
      `${this._url}/v1/contract/${contractTxId.toString()}/auctions`,
    );
    const { auctions } = await res.json();
    const domainsInAuction = new Set(Object.keys(auctions));

    if (address) {
      const cachedInteractions = await this._cache.get(contractTxId.toString());
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
    contractTxId = new ArweaveTransactionID(ARNS_REGISTRY_ADDRESS),
  }: {
    domain: string;
    contractTxId: ArweaveTransactionID;
  }): Promise<PDNSRecordEntry> {
    const res = await fetch(
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
    if ((cachedRecord && !auction) || cachedRecord.isBid) {
      return buildPendingArNSRecord(cachedRecord);
    }
    throw new Error('Error getting record');
  }

  async getRecords<T extends PDNSRecordEntry | PDNTContractDomainRecord>({
    contractTxId = new ArweaveTransactionID(ARNS_REGISTRY_ADDRESS),
    filters,
  }: {
    contractTxId?: ArweaveTransactionID;

    filters: {
      contractTxId?: ArweaveTransactionID[];
    };
  }): Promise<{ [x: string]: T }> {
    const cachedInteractions = await this._cache
      .getCachedInteractions(contractTxId)
      .filter(
        (interaction: ContractInteraction) =>
          interaction.payload.function ===
            (contractTxId.toString() === ARNS_REGISTRY_ADDRESS
              ? 'buyRecord'
              : 'setRecord') && !interaction.payload?.auction,
      );

    if (cachedInteractions) {
      await Promise.all(
        cachedInteractions.map(async (interaction: ContractInteraction) => {
          const interactionStatus = await this._arweave
            .getTransactionStatus(new ArweaveTransactionID(interaction.id))
            .catch(() => ({} as Record<string, boolean>));
          if (interactionStatus[interaction.id]) {
            this._cache.del(contractTxId.toString(), {
              key: 'id',
              value: interaction.id,
            });
          }
        }),
      );
    }

    const cachedRegistrations = cachedInteractions.reduce(
      (acc: Record<string, T>, interaction: ContractInteraction) => {
        // arns specific entry
        if (contractTxId.toString() === ARNS_REGISTRY_ADDRESS) {
          const domainName = interaction.payload.name as string;
          acc[domainName] = buildPendingArNSRecord(interaction) as T;
          return acc;
        }
        const subdomain = interaction.payload.subdomain as string;
        // ant specific entry
        acc[subdomain] = buildPendingANTRecord(interaction) as T;
        return acc;
      },
      {},
    );

    // TODO: this doesn't extend well, but allows multiple contractTxIds to be passed in
    // We'd want to create an array for any key that can be an array and then add it to the
    // array of [key, value]'s provided to URLSearchParams
    const urlQueryParams = new URLSearchParams(
      filters.contractTxId?.map((id) => ['contractTxId', id.toString()]),
    );

    const res = await fetch(
      `${
        this._url
      }/v1/contract/${contractTxId.toString()}/records?${urlQueryParams}`,
    );
    const { records } = await res.json();
    return { ...cachedRegistrations, ...records };
  }

  async getTokenBalance(
    address: ArweaveTransactionID,
    contractTxId: ArweaveTransactionID,
  ): Promise<number> {
    const res = await fetch(
      `${
        this._url
      }/v1/contract/${contractTxId.toString()}/balances/${address.toString()}`,
    );
    const { balance } = await res.json();
    return balance;
  }
}
