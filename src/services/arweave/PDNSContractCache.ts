import { identity, isArray } from 'lodash';

import {
  ArweaveDataProvider,
  ArweaveTransactionID,
  Auction,
  AuctionSettings,
  ContractInteraction,
  PDNSContractJSON,
  PDNSRecordEntry,
  PDNTContractJSON,
  SmartweaveContractCache,
  TransactionCache,
} from '../../types';
import { isDomainReservedLength, lowerCaseDomain } from '../../utils';
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
    address?: ArweaveTransactionID,
    // includePending: boolean
  ): Promise<T> {
    if (address) {
      const cachedTokens = await this._cache.get(address.toString());
      const cachedToken = cachedTokens?.find(
        (token: any) =>
          token.type === 'deploy' && token.id === contractTxId.toString(),
      );
      if (cachedToken) {
        return JSON.parse(cachedToken.payload.initState);
      }
    }
    // TODO: look at local pending iteractions, check for confirmations, if has confirmations del from cache
    // if we have pending interactions, manipulate state based on their payloads (map function names to state keys and apply payloads)

    // atticus opinion: implement state manipulation in PDNTContract class and ArNSRegistry contract class which implements this getContractState method and
    // adds cached interactions.
    const res = await fetch(
      `${this._url}/v1/contract/${contractTxId.toString()}`,
    );
    const { state } = await res.json();

    return state as T;
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
    return {
      contractTxIds: contractTxIds.map(
        (id: string) => new ArweaveTransactionID(id),
      ),
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
    const cachedInteractions = this._cache.get(key);

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
    address: ArweaveTransactionID,
  ): Promise<PDNTContract[]> {
    const cachedTokens = await this._cache.get(address.toString());

    const tokens = cachedTokens.map((token: any) => {
      if (token.type !== 'deploy') {
        return;
      }
      const contract = new PDNTContract(
        JSON.parse(token.payload.initState),
        new ArweaveTransactionID(token.id),
      );
      return contract;
    });
    return tokens.reduce((acc: any, token: any) => {
      if (token) {
        acc.push(token);
      }
      return acc;
    }, []);
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
      const cachedInteractions = await this._cache.get(address.toString());
      cachedInteractions.forEach((i: any) => {
        if (
          i.type === 'interaction' &&
          i.payload?.name === domain &&
          i.payload?.auction === true
        ) {
          console.log('found cached auction:');
          cachedAuction = {
            ...i,
            payload: {
              ...i.payload,
              contractTxId: i.id.toString(),
              initiator: address.toString(),
            },
          };
          console.log(cachedAuction);
        }
      });
      console.log('cached interactions: ', cachedInteractions);
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
            minimumBid: Object.values(auction.prices)[0],
            isActive: true,
          }
        : {}),
    };
    console.log(res, cachedAuction);
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

  async getDomainsInAuction(): Promise<string[]> {
    const res = await fetch(
      `${this._url}/v1/contract/${ARNS_REGISTRY_ADDRESS}/auctions`,
    );
    const { auctions } = await res.json();
    return Object.keys(auctions);
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

  async getRecords({
    contractTxId = new ArweaveTransactionID(ARNS_REGISTRY_ADDRESS),
    filters,
  }: {
    contractTxId?: ArweaveTransactionID;
    filters: {
      contractTxId?: ArweaveTransactionID[];
    };
  }): Promise<{ [x: string]: PDNSRecordEntry }> {
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
    return records;
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
