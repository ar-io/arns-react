import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useEffect, useState } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';

const defaultReserved = {
  isReserved: false,
  reservedFor: undefined,
};

export function useRegistrationStatus(domain: string) {
  const [{ arweaveDataProvider }] = useGlobalState();
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isReserved, setIsReserved] = useState<{
    isReserved: boolean;
    reservedFor?: ArweaveTransactionID;
  }>(defaultReserved);
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
    setIsReserved(defaultReserved);
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
      const availablePromise = arweaveDataProvider.isDomainAvailable({
        domain,
      });
      const reservedPromise = arweaveDataProvider.isDomainReserved({
        domain,
      });

      const [isAvailable, isReserved] = await Promise.all([
        availablePromise,
        reservedPromise,
      ]);

      setIsAvailable(isAvailable);
      setIsReserved({
        ...isReserved,
        reservedFor: isReserved.reservedFor
          ? new ArweaveTransactionID(isReserved.reservedFor)
          : undefined,
      });
      setValidated(true);
    } catch (error) {
      console.error(error);
      reset();
    } finally {
      setLoading(false);
    }
  }
  return {
    isAvailable,
    isReserved: isReserved?.isReserved,
    reservedFor: isReserved?.reservedFor,
    loading,
    validated,
  };
}
