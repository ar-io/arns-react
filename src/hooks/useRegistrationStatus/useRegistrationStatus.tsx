import { useEffect, useState } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';

const defaultReserved = false;

export function useRegistrationStatus(domain: string) {
  const [{ arweaveDataProvider }] = useGlobalState();
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isReserved, setIsReserved] = useState<boolean>(defaultReserved);
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
      // TODO: use a hook with react-query for this call
      const isAvailable = await arweaveDataProvider.isDomainAvailable({
        domain,
      });

      const isReserved = domain === 'www';

      setIsAvailable(isAvailable);
      setIsReserved(isReserved);
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
    isReserved,
    loading,
    validated,
  };
}
