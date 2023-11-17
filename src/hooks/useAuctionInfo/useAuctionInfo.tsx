import { useEffect, useState } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';
import { Auction, TRANSACTION_TYPES } from '../../types';

/**
 * @param domain this hook is used to get the auction information for a given domain - if a live auction exists,
 * it will return the auction information, otherwise, it will generate the information based on the
 * current auction settings from the registry contract
 * @param registrationType
 * @param leaseDuration
 */

export function useAuctionInfo(
  domain?: string,
  registrationType?: TRANSACTION_TYPES,
): {
  auction: Auction | undefined;
  loadingAuctionInfo: boolean;
  lastUpdated: number | undefined;
} {
  const [{ blockHeight, lastBlockUpdateTimestamp, arweaveDataProvider }] =
    useGlobalState();
  const [auction, setAuction] = useState<Auction>();
  const [loadingAuctionInfo, setLoadingAuctionInfo] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<number | undefined>();

  useEffect(() => {
    if (!domain) {
      return;
    }
    updateAuctionInfo(domain);
  }, [blockHeight, lastBlockUpdateTimestamp, registrationType, domain]);

  async function updateAuctionInfo(domainName: string) {
    try {
      setLoadingAuctionInfo(true);
      const auction = await arweaveDataProvider.getAuction({
        domain: domainName,
        type: registrationType,
      });
      setLastUpdated(Date.now());
      setAuction(auction);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAuctionInfo(false);
    }
  }

  return {
    auction,
    loadingAuctionInfo,
    lastUpdated,
  };
}
