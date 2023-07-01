import { useEffect, useState } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';
import { Auction, AuctionSettings } from '../../types';
import { calculateMinimumAuctionBid } from '../../utils';
import eventEmitter from '../../utils/events';
import { useArweaveCompositeProvider } from '../useArweaveCompositeProvider/useArweaveCompositeProvider';

function useAuctionInfo(domain: string) {
  const [{ pdnsSourceContract, blockHieght }, dispatchGlobalState] =
    useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [auctionSettings, setAuctionSettings] = useState<
    AuctionSettings | undefined
  >();
  const [auction, setAuction] = useState<Auction | undefined>();
  const [price, setPrice] = useState<number>(0);
  const [prices, setPrices] = useState<{ [X: string]: number }>({});

  useEffect(() => {
    if (!domain || !blockHieght) {
      arweaveDataProvider
        .getCurrentBlockHeight()
        .then((newBlockHieght: number) => {
          dispatchGlobalState({
            type: 'setBlockHieght',
            payload: newBlockHieght,
          });
        })
        .catch((error) => eventEmitter.emit('error', error));
      return;
    }

    if (pdnsSourceContract?.auctions) {
      const auction = pdnsSourceContract?.auctions[domain];
      if (!auction) {
        console.error('error', new Error(`No auction for ${domain} found.`));
        return;
      }
      setAuction(auction);
    }
    if (auction && pdnsSourceContract?.settings?.auctions?.history) {
      const auctionSettings =
        pdnsSourceContract?.settings?.auctions?.history.find(
          (a: AuctionSettings) => a.id === auction?.auctionSettingsId,
        );
      setAuctionSettings(auctionSettings);
    }
    if (auction && auctionSettings && blockHieght) {
      const { startHeight, startPrice: initialPrice, floorPrice } = auction;
      const { decayInterval, decayRate, auctionDuration } = auctionSettings;
      const currentBlockHeight = blockHieght;
      const minAuctionBid = calculateMinimumAuctionBid({
        startHeight,
        initialPrice,
        floorPrice,
        currentBlockHeight,
        decayInterval,
        decayRate,
      });
      setPrice(minAuctionBid);

      const pricesMap = updatePrices(
        startHeight,
        initialPrice,
        floorPrice,
        decayInterval,
        decayRate,
        auctionDuration,
      );
      setPrices(pricesMap);
    }
  }, [
    auction,
    blockHieght,
    pdnsSourceContract?.settings?.auctions?.history,
    pdnsSourceContract?.auctions,
    domain,
  ]);

  function updatePrices(
    _startHeight: number,
    _initialPrice: number,
    _floorPrice: number,
    _decayInterval: number,
    _decayRate: number,
    _auctionDuration: number,
  ): { [X: string]: number } {
    const expiredHieght = _startHeight + _auctionDuration;
    let currentHeight = _startHeight;
    const newPrices: { [X: string]: number } = {};
    while (currentHeight < expiredHieght) {
      const blockPrice = calculateMinimumAuctionBid({
        startHeight: _startHeight,
        initialPrice: _initialPrice,
        floorPrice: _floorPrice,
        currentBlockHeight: currentHeight,
        decayInterval: _decayInterval,
        decayRate: _decayRate,
      });

      newPrices[currentHeight.toString()] = blockPrice;
      currentHeight = currentHeight + _decayInterval;
    }

    newPrices[expiredHieght.toString()] = _floorPrice;
    return newPrices;
  }

  return { minimumAuctionBid: price, prices, auction, auctionSettings };
}

export default useAuctionInfo;
