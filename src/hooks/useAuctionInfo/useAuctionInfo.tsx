import { useEffect, useState } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';
import { Auction, AuctionSettings, TRANSACTION_TYPES } from '../../types';
import {
  calculateMinimumAuctionBid,
  generateAuction,
  isDomainAuctionable,
  lowerCaseDomain,
  updatePrices,
} from '../../utils';
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
  }, [pdnsSourceContract?.auctions, domain, registrationType]);

  useEffect(() => {
    updateAuctionSettings();
  }, [auction, pdnsSourceContract?.settings?.auctions?.history]);

  useEffect(() => {
    updatePrice();
  }, [auction, blockHeight]);

  function reset() {
    setAuctionSettings(undefined);
    setAuction(undefined);
    setPrice(0);
    setPrices(undefined);
    setIsLiveAuction(false);
  }

  function updateAuctionSettings() {
    try {
      setLoadingAuctionInfo(true);
      if (auction && pdnsSourceContract?.settings?.auctions?.history) {
        const foundAuctionSettings =
          pdnsSourceContract?.settings?.auctions?.history.find(
            (a: AuctionSettings) => a.id === auction.auctionSettingsId,
          );

        setAuctionSettings(foundAuctionSettings);
      }
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setLoadingAuctionInfo(false);
    }
  }

  function updatePrice() {
    try {
      setLoadingAuctionInfo(true);
      if (auction && auctionSettings && blockHeight) {
        const calculatedPrice = calculateMinimumAuctionBid({
          startHeight: auction.startHeight,
          initialPrice: auction.startPrice,
          floorPrice: auction.floorPrice,
          currentBlockHeight: blockHeight,
          decayInterval: auctionSettings.decayInterval,
          decayRate: auctionSettings.decayRate,
        });

        setPrice(calculatedPrice);
        const newPrices = updatePrices({
          startHeight: auction.startHeight,
          initialPrice: auction.startPrice,
          auctionDuration: auctionSettings.auctionDuration,
          floorPrice: auction.floorPrice,
          decayInterval: auctionSettings.decayInterval,
          decayRate: auctionSettings.decayRate,
        });
        setPrices(newPrices);
      }
    } catch (error) {
      eventEmitter.emit('error', error);
      reset();
    } finally {
      setLoadingAuctionInfo(false);
    }
  }

  async function updateAuctionInfo(domainName: string) {
    try {
      setLoadingAuctionInfo(true);
      if (
        !isDomainAuctionable({
          domain,
          registrationType: registrationType ?? TRANSACTION_TYPES.BUY,
          reservedList: Object.keys(pdnsSourceContract.reserved),
        })
      ) {
        setLoadingAuctionInfo(false);
        return;
      }

      const newBlock = await arweaveDataProvider.getCurrentBlockHeight();
      dispatchGlobalState({
        type: 'setBlockHeight',
        payload: newBlock,
      });

      if (pdnsSourceContract?.auctions) {
        const foundAuction =
          pdnsSourceContract?.auctions[lowerCaseDomain(domainName)];

        if (foundAuction) {
          const foundAuctionSettings =
            pdnsSourceContract?.settings?.auctions?.history.find(
              (a: AuctionSettings) => a.id === foundAuction.auctionSettingsId,
            );
          setAuction(foundAuction);
          setAuctionSettings(foundAuctionSettings);
          setIsLiveAuction(true);
        }

        if (pdnsSourceContract.settings.auctions) {
          if (!registrationType) {
            throw new Error(
              'unable to generate auction prices without registration type',
              registrationType,
            );
          }

          if (!walletAddress) {
            throw new Error(
              `No wallet connected, unable to generate auction prices.`,
            );
          }

          const [newAuction, newAuctionSettings] = generateAuction({
            domain: domainName,
            registrationType,
            years: leaseDuration ?? 1,
            auctionSettings: pdnsSourceContract.settings.auctions,
            fees: pdnsSourceContract.fees,
            currentBlockHeight: blockHeight ?? newBlock,
            walletAddress,
          }); // sets contract id as atomic by default
          setAuction(newAuction);
          setAuctionSettings(newAuctionSettings);
          setIsLiveAuction(false);
        }
      }
    } catch (error) {
      eventEmitter.emit('error', error);
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
