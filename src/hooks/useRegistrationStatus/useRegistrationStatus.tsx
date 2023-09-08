import { useEffect, useState } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';
import { useArweaveCompositeProvider } from '../useArweaveCompositeProvider/useArweaveCompositeProvider';

export function useRegistrationStatus(domain: string) {
  const [{ blockHeight }, dispatchGlobalState] = useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();

  const [isAvailable, setIsAvailable] = useState<boolean>();
  const [isAuction, setIsAuction] = useState<boolean>();
  const [isReserved, setIsReserved] = useState<boolean>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (loading) {
      return;
    }
    updateRegistrationStatus(domain);
  }, [domain]);

  function reset() {
    setIsAvailable(undefined);
    setIsAuction(undefined);
    setIsReserved(undefined);
  }

  async function updateRegistrationStatus(domain: string) {
    try {
      reset();
      setLoading(true);

      if (!domain.length) {
        return reset();
      }

      if (!blockHeight) {
        const block = await arweaveDataProvider.getCurrentBlockHeight();
        if (!block) {
          throw new Error('Could not get current block height');
        }
        dispatchGlobalState({
          type: 'setBlockHeight',
          payload: block,
        });
        return;
      }
      const available = arweaveDataProvider.isDomainAvailable({
        domain,
      });
      const auction = arweaveDataProvider
        .getAuctionPrices(domain, blockHeight)
        .catch(() => undefined);
      const reserved = arweaveDataProvider.isDomainReserved({
        domain,
      });

      const [isAvailable, isAuction, isReserved] = await Promise.all([
        available,
        auction,
        reserved,
      ]);
      setIsAvailable(isAvailable);
      setIsAuction(!!isAuction);
      setIsReserved(isReserved);
    } catch (error) {
      console.error(error);
      reset();
    } finally {
      setLoading(false);
    }
  }
  return [
    { isAvailable, isAuction, isReserved, loading },
    updateRegistrationStatus,
  ] as const;
}
