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
    { pdnsSourceContract, blockHeight: blockHeight, walletAddress, gateway },
    dispatchGlobalState,
  ] = useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [auctionSettings, setAuctionSettings] = useState<AuctionSettings>();
  const [auction, setAuction] = useState<Auction>();
  const [price, setPrice] = useState<number>(0);
  const [prices, setPrices] = useState<{ [X: string]: number }>();
  const [isLiveAuction, setIsLiveAuction] = useState<boolean>(false);

  function reset() {
    setAuctionSettings(undefined);
    setAuction(undefined);
    setPrice(0);
    setPrices(undefined);
    setIsLiveAuction(false);
  }

  useEffect(() => {
    try {
      if (!domain) {
        reset();
        console.debug(
          'No domain provided to useAuctionInfo hook. To calculate auction prices a domain is required.',
        );

        return;
      }

      if (!blockHeight) {
        arweaveDataProvider
          .getCurrentBlockHeight()
          .then((b: number) => {
            dispatchGlobalState({
              type: 'setBlockHeight',
              payload: b,
            });
          })
          .catch(() => {
            throw new Error(
              `Error getting block height from ${gateway}, unable to calculate auction prices.`,
            );
          });
        return;
      }

      if (
        !isDomainAuctionable({
          domain,
          registrationType: registrationType ?? TRANSACTION_TYPES.BUY,
          reservedList: Object.keys(pdnsSourceContract.reserved),
        })
      ) {
        return;
      }

      if (pdnsSourceContract?.auctions) {
        const foundAuction =
          pdnsSourceContract?.auctions[lowerCaseDomain(domain)];

        if (foundAuction) {
          const foundAuctionSettings =
            pdnsSourceContract?.settings?.auctions?.history.find(
              (a: AuctionSettings) => a.id === foundAuction.auctionSettingsId,
            );
          setAuction(foundAuction);
          setAuctionSettings(foundAuctionSettings);
          setIsLiveAuction(true);
          return;
        }

        if (pdnsSourceContract.settings.auctions) {
          if (!registrationType) {
            console.debug(
              'unable to generate auction prices without registration type',
              { registrationType },
            );
            return;
          }

          if (!walletAddress) {
            throw new Error(
              `No wallet connected, unable to generate auction prices.`,
            );
          }

          const [newAuction, newAuctionSettings] = generateAuction({
            domain,
            registrationType,
            years: leaseDuration ?? 1,
            auctionSettings: pdnsSourceContract.settings.auctions,
            fees: pdnsSourceContract.fees,
            currentBlockHeight: blockHeight,
            walletAddress,
          }); // sets contract id as atomic by default
          setAuction(newAuction);
          setAuctionSettings(newAuctionSettings);
          setIsLiveAuction(false);
          return;
        }

        // if auction found, set live auction
        setIsLiveAuction(true);
        setAuction(foundAuction);
      }
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }, [
    blockHeight,
    pdnsSourceContract?.auctions,
    pdnsSourceContract?.settings?.auctions,
    domain,
    registrationType,
  ]);

  useEffect(() => {
    if (auction && pdnsSourceContract?.settings?.auctions?.history) {
      const foundAuctionSettings =
        pdnsSourceContract?.settings?.auctions?.history.find(
          (a: AuctionSettings) => a.id === auction.auctionSettingsId,
        );

      setAuctionSettings(foundAuctionSettings);
    }
  }, [auction, pdnsSourceContract?.settings?.auctions?.history]);

  useEffect(() => {
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
  }, [auction, auctionSettings, blockHeight]);

  return {
    minimumAuctionBid: price,
    isLiveAuction,
    auction,
    auctionSettings,
    prices,
  };
}
