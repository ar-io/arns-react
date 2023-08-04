import { useEffect, useState } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';
import { useArweaveCompositeProvider } from '../useArweaveCompositeProvider/useArweaveCompositeProvider';

function useRegistrationStatus(domain: string) {
  const [{ pdnsSourceContract }] = useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isAuction, setIsAuction] = useState<boolean>(false);
  const [isReserved, setIsReserved] = useState<boolean>(false);

  useEffect(() => {
    updateRegistrationStatus(domain);
  }, [domain]);

  async function updateRegistrationStatus(domain: string) {
    try {
      const available = arweaveDataProvider.isDomainAvailable({
        domain,
        domainsList: Object.keys(pdnsSourceContract.records),
      });
      const auction = arweaveDataProvider.isDomainInAuction({
        domain,
        auctionsList: Object.keys(pdnsSourceContract.auctions ?? {}),
      });
      const reserved = arweaveDataProvider.isDomainReserved({
        domain,
        reservedList: Object.keys(pdnsSourceContract.reserved),
      });
      const [isAvailable, isAuction, isReserved] = await Promise.all([
        available,
        auction,
        reserved,
      ]);
      setIsAvailable(isAvailable);
      setIsAuction(isAuction);
      setIsReserved(isReserved);
    } catch (error) {
      console.error(error);
    }
  }

  return { isAvailable, isAuction, isReserved };
}

export default useRegistrationStatus;
