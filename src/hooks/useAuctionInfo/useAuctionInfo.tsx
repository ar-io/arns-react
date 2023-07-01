import { update } from 'lodash';
import { useEffect, useState } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';
import { Auction, AuctionSettings, TRANSACTION_TYPES } from '../../types';
import {
  calculateMinimumAuctionBid,
  generateAuction,
  isDomainAuctionable,
  updatePrices,
} from '../../utils';
import eventEmitter from '../../utils/events';
import { useArweaveCompositeProvider } from '../useArweaveCompositeProvider/useArweaveCompositeProvider';

/**
 *
 * @param domain this hook is used to get the auction information for a given domain - if a live auction exists,
 * it will return the auction information, otherwise, it will generate the information based on the
 * current auction settings from the registry contract
 * @param registrationType
 * @param leaseDuration
 *
 */

function useAuctionInfo(
  domain: string,
  registrationType?: TRANSACTION_TYPES,
  leaseDuration?: number,
) {
  const [
    { pdnsSourceContract, blockHieght, walletAddress, gateway },
    dispatchGlobalState,
  ] = useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [auctionSettings, setAuctionSettings] = useState<AuctionSettings>();
  const [auction, setAuction] = useState<Auction>();
  const [price, setPrice] = useState<number>(0);
  const [prices, setPrices] = useState<{ [X: string]: number }>();
  const [isLiveAuction, setIsLiveAuction] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (!domain) {
        console.debug(
          'No domain provided to useAuctionInfo hook. To calculate auction prices a domain is required.',
        );
        return;
      }

      if (!blockHieght) {
        arweaveDataProvider
          .getCurrentBlockHeight()
          .then((b: number) => {
            dispatchGlobalState({
              type: 'setBlockHieght',
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

      if (pdnsSourceContract?.auctions) {
        const foundAuction = pdnsSourceContract?.auctions[domain];
        const foundAuctionSettings =
          pdnsSourceContract?.settings?.auctions?.history.find(
            (a: AuctionSettings) => a.id === foundAuction.auctionSettingsId,
          );
        if (foundAuction) {
          setAuction(foundAuction);
          setAuctionSettings(foundAuctionSettings);
          setIsLiveAuction(true);
          return;
        } else {
          if (pdnsSourceContract.settings.auctions) {
            if (!registrationType) {
              throw new Error(
                `No registration type provided, unable to generate auction prices.`,
              );
            }
            if (
              !isDomainAuctionable({
                domain,
                registrationType,
                reservedList: Object.keys(pdnsSourceContract.reserved),
              })
            ) {
              throw new Error(`${domain} is not an auctionable domain.`);
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
              tierSettings: pdnsSourceContract.tiers,
              fees: pdnsSourceContract.fees,
              currentBlockHeight: blockHieght,
              walletAddress,
            }); // sets contract id as atomic by default
            setAuction(newAuction);
            setAuctionSettings(newAuctionSettings);
            setIsLiveAuction(false);
          }
        }
        // if auction found, set live auction
        setIsLiveAuction(true);
        setAuction(foundAuction);
      }
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }, [
    blockHieght,
    pdnsSourceContract?.auctions,
    pdnsSourceContract?.settings?.auctions,
    domain,
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
    if (auction && auctionSettings && blockHieght) {
      const calculatedPrice = calculateMinimumAuctionBid({
        startHeight: auction.startHeight,
        initialPrice: auction.startPrice,
        floorPrice: auction.floorPrice,
        currentBlockHeight: blockHieght,
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
  }, [auction, auctionSettings, blockHieght]);

  return {
    minimumAuctionBid: price,
    isLiveAuction,
    auction,
    auctionSettings,
    prices,
  };
}

export default useAuctionInfo;
