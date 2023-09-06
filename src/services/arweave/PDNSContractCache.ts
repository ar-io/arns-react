import { isArray } from 'lodash';

import {
  ArweaveTransactionID,
  Auction,
  AuctionSettings,
  ContractInteraction,
  FullAuctionInfo,
  PDNSContractJSON,
  PDNTContractJSON,
  SmartweaveContractCache,
  TransactionCache,
} from '../../types';
import {
  calculateMinimumAuctionBid,
  isDomainReservedLength,
  lowerCaseDomain,
  updatePrices,
} from '../../utils';
import { PDNS_REGISTRY_ADDRESS } from '../../utils/constants';
import { LocalStorageCache } from '../cache/LocalStorageCache';
import { PDNTContract } from './PDNTContract';

export class PDNSContractCache implements SmartweaveContractCache {
  private _url: string;
  private _cache: TransactionCache;

  constructor(url: string, cache: TransactionCache = new LocalStorageCache()) {
    this._url = url;
    this._cache = cache;
  }

  async getContractState<T extends PDNTContractJSON | PDNSContractJSON>(
    contractTxId: ArweaveTransactionID,
    address?: ArweaveTransactionID,
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
      }/v1/contract/${PDNS_REGISTRY_ADDRESS}/reserved/${lowerCaseDomain(
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
    const res = await fetch(
      `${
        this._url
      }/v1/contract/${PDNS_REGISTRY_ADDRESS}/records/${lowerCaseDomain(
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

  async getAuction(domain: string): Promise<Auction> {
    const auctionRes = await fetch(
      `${this._url}/v1/contract/${PDNS_REGISTRY_ADDRESS}/auctions`,
    );
    const { auctions } = await auctionRes.json();
    const auction = auctions[lowerCaseDomain(domain)];
    if (!auction) {
      throw new Error('Provided domain is not in auction');
    }

    return auction;
  }

  async getAuctionSettings(id: string): Promise<AuctionSettings> {
    const res = await fetch(
      `${this._url}/v1/contract/${PDNS_REGISTRY_ADDRESS}/settings`,
    );
    const { settings } = await res.json();
    const auctionSettings = settings.auctions.history.find(
      (s: any) => s.id === id,
    );
    if (!auctionSettings) {
      throw new Error('Auction was created with invalid settings');
    }
    return auctionSettings;
  }

  async getFullAuctionInfo(
    domain: string,
    currentBlockHeight: number,
  ): Promise<FullAuctionInfo> {
    const auction = await this.getAuction(domain);
    const auctionSettings = await this.getAuctionSettings(
      auction.auctionSettingsId,
    );
    const prices = updatePrices({
      ...auctionSettings,
      ...auction,
    });
    const isExpired =
      auction.startHeight + auctionSettings.auctionDuration <
      currentBlockHeight;
    const minimumAuctionBid = calculateMinimumAuctionBid({
      ...auction,
      ...auctionSettings,
      currentBlockHeight,
    });

    return {
      ...auction,
      ...auctionSettings,
      minimumAuctionBid,
      prices,
      isExpired,
    };
  }

  async getDomainsInAuction(): Promise<string[]> {
    const res = await fetch(
      `${this._url}/v1/contract/${PDNS_REGISTRY_ADDRESS}/auctions`,
    );
    const { auctions } = await res.json();
    return Object.keys(auctions);
  }
}
