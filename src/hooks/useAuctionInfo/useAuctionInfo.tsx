import { useEffect, useState } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';
import { useWalletState } from '../../state/contexts/WalletState';
import { Auction, TRANSACTION_TYPES } from '../../types';
import eventEmitter from '../../utils/events';

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
} {
  const [{ blockHeight, arweaveDataProvider }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const [auction, setAuction] = useState<Auction>();
  const [loadingAuctionInfo, setLoadingAuctionInfo] = useState<boolean>(true);

  useEffect(() => {
    if (!domain) {
      return;
    }
    updateAuctionInfo(domain);
  }, [blockHeight, registrationType, domain]);

  async function updateAuctionInfo(domainName: string) {
    try {
      setLoadingAuctionInfo(true);
      const auction = await arweaveDataProvider.getAuction({
        domain: domainName,
        type: registrationType,
        address: walletAddress,
      });
      setAuction(auction);
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setLoadingAuctionInfo(false);
    }
  }
  console.log(auction);

  return {
    auction,
    loadingAuctionInfo,
  };
}
