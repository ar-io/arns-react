import { isArray } from 'lodash';

import {
  ArweaveDataProvider,
  ArweaveTransactionID,
  Auction,
  AuctionSettings,
  ContractInteraction,
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
  isDomainReservedLength,
  lowerCaseDomain,
} from '../../utils';
import { ARNS_REGISTRY_ADDRESS } from '../../utils/constants';
import { LocalStorageCache } from '../cache/LocalStorageCache';
import { PDNTContract } from './PDNTContract';

export class PDNSContractCache implements SmartweaveContractCache {
  protected _url: string;
  protected _cache: TransactionCache;
  protected _arweave: ArweaveDataProvider;

  constructor({
    url,
    arweave,
    cache = new LocalStorageCache(),
  }: {
    url: string;
    arweave: ArweaveDataProvider;
    cache?: TransactionCache;
  }) {
    this._url = url;
    this._cache = cache;
    this._arweave = arweave;
  }

  async getContractState<T extends PDNTContractJSON | PDNSContractJSON>(
    contractTxId: ArweaveTransactionID,
    currentBlockHeight?: number,
  ): Promise<T> {
    // if we have pending interactions, manipulate state based on their payloads (map function names to state keys and apply payloads)

    // atticus opinion: implement state manipulation in PDNTContract class and ArNSRegistry contract class which implements this getContractState method and
    // adds cached interactions.

    try {
      const res = await fetch(
        `${this._url}/v1/contract/${contractTxId.toString()}`,
      );
      const { state } = await res.json();

      if (currentBlockHeight) {
        const cachedTokens = await this.getCachedNameTokens();
        const cachedToken = cachedTokens?.find(
          (token: any) => token.id.toString() === contractTxId.toString(),
        );
        const cachedInteractions = await this._cache.getCachedInteractions(
          contractTxId,
        );
        if (cachedInteractions) {
          await Promise.all(
            cachedInteractions.map(async (interaction: ContractInteraction) => {
              const interactionStatus =
                await this._arweave.getTransactionStatus(
                  new ArweaveTransactionID(interaction.id),
                );
              if (interactionStatus[interaction.id]) {
                await this._cache.del(contractTxId.toString(), {
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
    const cachedTokens = await this.getCachedNameTokens(address);

    return {
      contractTxIds: [
        ...new Set<ArweaveTransactionID>(
          [
            ...contractTxIds,
            ...cachedTokens.map((token: PDNTContract) => token.id?.toString()),
          ].map((id: string) => new ArweaveTransactionID(id)),
        ),
      ],
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
      (i) =>
        !gqlIndexedInteractions.find(
          (gqlInteraction: ContractInteraction) => gqlInteraction.id === i.id,
        ),
    );

    // update the cache to remove indexed transactions for
    this._cache.set(key, pendingInteractions);

    // return only the ones relevant to the specified contract
    return pendingInteractions.filter(
      (i) => i.contractTxId === contractTxId.toString(),
    );
  }
  // TODO: implement arns service query for the following 3 functions
  async isDomainReserved({ domain }: { domain: string }): Promise<boolean> {
    const res = await fetch(
      `${
        this._url
      }/v1/contract/${ARNS_REGISTRY_ADDRESS}/reserved/${lowerCaseDomain(
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
      .then((auction: Auction) => auction.isActive) // it found the auction
      .catch(() => false); // it returned a 404 or otherwise failed
  }

  async isDomainAvailable({ domain }: { domain: string }): Promise<boolean> {
    const res = await fetch(
      `${
        this._url
      }/v1/contract/${ARNS_REGISTRY_ADDRESS}/records/${lowerCaseDomain(
        domain,
      )}`,
    );
    const isAvailable = res.status !== 200;

    return isAvailable;
  }

  async getCachedNameTokens(
    address?: ArweaveTransactionID,
  ): Promise<PDNTContract[]> {
    return this._cache.getCachedNameTokens(address);
  }

  async getAuction({
    contractTxId,
    domain,
    type,
    address,
  }: {
    contractTxId: ArweaveTransactionID;
    domain: string;
    type?: 'lease' | 'permabuy';
    address?: ArweaveTransactionID;
  }): Promise<Auction> {
    let cachedAuction: any;
    if (address) {
      const cachedInteractions = await this._cache.getCachedInteractions(
        contractTxId,
      );
      cachedInteractions.forEach((i: ContractInteraction) => {
        if (i.payload?.name === domain && i.payload?.auction === true) {
          cachedAuction = {
            ...i,
            payload: {
              ...i.payload,
              contractTxId: i.id.toString(),
              initiator: i.deployer,
            },
          };
        }
      });
    }
    const urlParams = cachedAuction
      ? new URLSearchParams({ type: cachedAuction?.payload?.type })
      : type
      ? new URLSearchParams({ type })
      : new URLSearchParams();
    const auctionRes = await fetch(
      `${
        this._url
      }/v1/contract/${contractTxId.toString()}/auctions/${domain}?${urlParams.toString()}`,
    );
    const { result: auction } = await auctionRes.json();
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
            isActive: true,
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
      cachedInteractions.forEach((i: any) => {
        if (
          i.payload?.auction === true &&
          i.deployer === address.toString() &&
          !domainsInAuction.has(i.payload.name)
        ) {
          domainsInAuction.add(i.payload.name);
        }
      });
    }
    return [...domainsInAuction];
  }

  async getRecord(domain: string): Promise<PDNSRecordEntry> {
    const res = await fetch(
      `${
        this._url
      }/v1/contract/${ARNS_REGISTRY_ADDRESS}/records/${lowerCaseDomain(
        domain,
      )}`,
    );
    const { record } = await res.json();
    return record;
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
    // TODO: add getCachedRegistrations to transaction cache as a method once cache is converted to contractTxId index
    const cachedRegistrations: Record<string, T> = {};

    const cachedInteractions = await this._cache
      .getCachedInteractions(contractTxId)
      .filter(
        (i: ContractInteraction) =>
          i.payload.function ===
            (contractTxId.toString() === ARNS_REGISTRY_ADDRESS
              ? 'buyRecord'
              : 'setRecord') && !i.payload?.auction,
      );
    cachedInteractions.forEach(
      (interaction: ContractInteraction) =>
        (cachedRegistrations[
          (contractTxId.toString() === ARNS_REGISTRY_ADDRESS
            ? interaction.payload.name
            : interaction.payload.subDomain) as string
        ] = (
          contractTxId.toString() === ARNS_REGISTRY_ADDRESS
            ? buildPendingArNSRecord(interaction)
            : buildPendingANTRecord(interaction)
        ) as T),
    );

    const urlQueryParams = (filters.contractTxId ?? [])
      .map((id) =>
        new URLSearchParams({
          contractTxId: id.toString(),
        }).toString(),
      )
      .join('&');
    // TODO: add other query params

    const res = await fetch(
      `${
        this._url
      }/v1/contract/${contractTxId.toString()}/records?${urlQueryParams}`,
    );
    const { records } = await res.json();
    return { ...cachedRegistrations, ...records };
  }

  async getIoBalance(address: ArweaveTransactionID): Promise<number> {
    const res = await fetch(
      `${
        this._url
      }/v1/contract/${ARNS_REGISTRY_ADDRESS}/balances/${address.toString()}`,
    );
    const { balance } = await res.json();
    return balance;
  }
}
