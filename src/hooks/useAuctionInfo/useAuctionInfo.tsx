import { useEffect, useState } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';
import { Auction, AuctionSettings, TRANSACTION_TYPES } from '../../types';
import { generateAuction, updatePrices } from '../../utils';
import eventEmitter from '../../utils/events';
import { useArweaveCompositeProvider } from '../useArweaveCompositeProvider/useArweaveCompositeProvider';

/**
 * @param domain this hook is used to get the auction information for a given domain - if a live auction exists,
 * it will return the auction information, otherwise, it will generate the information based on the
 * current auction settings from the registry contract
 * @param registrationType
 * @param leaseDuration
 */

export function useAuctionInfo(
  domain: string,
  registrationType?: TRANSACTION_TYPES,
  leaseDuration?: number,
) {
  const [
    { pdnsSourceContract, blockHeight, walletAddress },
    dispatchGlobalState,
  ] = useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [auctionSettings, setAuctionSettings] = useState<AuctionSettings>();
  const [auction, setAuction] = useState<Auction>();
  const [price, setPrice] = useState<number>(0);
  const [prices, setPrices] = useState<{ [X: string]: number }>();
  const [isLiveAuction, setIsLiveAuction] = useState<boolean>(false);
  const [loadingAuctionInfo, setLoadingAuctionInfo] = useState<boolean>(false);

  // TODO: Fix wacky up pricing

  useEffect(() => {
    if (!domain.length) {
      return;
    }
    updateAuctionInfo(domain);
  }, [domain, registrationType, blockHeight, leaseDuration]);

  async function updateAuctionInfo(domainName: string) {
    try {
      setLoadingAuctionInfo(true);

      if (!blockHeight) {
        const newBlock = await arweaveDataProvider.getCurrentBlockHeight();
        dispatchGlobalState({
          type: 'setBlockHeight',
          payload: newBlock,
        });
        return;
      }

      const auctionInfo = await arweaveDataProvider.getFullAuctionInfo(
        domainName,
        blockHeight,
      );

      if (auctionInfo) {
        setAuction({
          auctionSettingsId: auctionInfo.id,
          contractTxId: auctionInfo.contractTxId,
          floorPrice: auctionInfo.floorPrice,
          startPrice: auctionInfo.startPrice,
          type: auctionInfo.type,
          startHeight: auctionInfo.startHeight,
          initiator: auctionInfo.initiator,
          years: auctionInfo?.years,
        });
        setAuctionSettings({
          id: auctionInfo.id,
          floorPriceMultiplier: auctionInfo.floorPriceMultiplier,
          startPriceMultiplier: auctionInfo.startPriceMultiplier,
          auctionDuration: auctionInfo.auctionDuration,
          decayRate: auctionInfo.decayRate,
          decayInterval: auctionInfo.decayInterval,
        });
        setPrices(auctionInfo.prices);
        setPrice(auctionInfo.minimumAuctionBid);
        setIsLiveAuction(true);
      }

      // if not live auction, generate auction info. Should only be called when registering a new domain.

      if (walletAddress && registrationType && !auctionInfo) {
        const [newAuction, newAuctionSettings] = generateAuction({
          domain: domainName,
          registrationType,
          years: leaseDuration ?? 1,
          auctionSettings: pdnsSourceContract.settings.auctions,
          fees: pdnsSourceContract.fees,
          currentBlockHeight: blockHeight,
          walletAddress,
        }); // sets contract id as atomic by default
        const prices = updatePrices({
          ...newAuction,
          ...newAuctionSettings,
        });

        setAuction(newAuction);
        setAuctionSettings(newAuctionSettings);
        setPrices(prices);
        setPrice(newAuction?.floorPrice);
        setIsLiveAuction(false);
      }
    } catch (error) {
      eventEmitter.emit('error', error);
      console.error(error);
    } finally {
      setLoadingAuctionInfo(false);
    }
  }

  return {
    minimumAuctionBid: price,
    isLiveAuction,
    auction,
    auctionSettings,
    prices,
    updateAuctionInfo,
    loadingAuctionInfo,
  };
}
