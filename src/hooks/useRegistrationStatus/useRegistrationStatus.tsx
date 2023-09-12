import { set } from 'lodash';
import { useEffect, useState } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';
import { useArweaveCompositeProvider } from '../useArweaveCompositeProvider/useArweaveCompositeProvider';

export function useRegistrationStatus(domain: string) {
  const [{ blockHeight }, dispatchGlobalState] = useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();

  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isAuction, setIsAuction] = useState<boolean>(false);
  const [isReserved, setIsReserved] = useState<boolean>(false);
  const [validated, setValidated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!domain.length) {
      reset();
    }
    updateRegistrationStatus(domain);
  }, [domain]);

  function reset() {
    setIsAvailable(false);
    setIsAuction(false);
    setIsReserved(false);
    setValidated(false);
  }

  async function updateRegistrationStatus(domain: string) {
    try {
      reset();
      setLoading(true);
      setValidated(false);

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
      // TODO: remove contract usage (use the service)
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
      setValidated(true);
    } catch (error) {
      console.error(error);
      reset();
    } finally {
      setLoading(false);
    }
  }
  return [
    { isAvailable, isAuction, isReserved, loading, validated },
    updateRegistrationStatus,
  ] as const;
}
