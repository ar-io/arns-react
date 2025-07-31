import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useEffect, useState } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';
import { useArNSRecord } from '../useArNSRecord';
import { useArNSReserved } from '../useArNSReserved';

const defaultReserved = {
  isReserved: false,
  reservedFor: undefined,
};

export function useRegistrationStatus(domain: string) {
  const [{ arioProcessId }] = useGlobalState();
  const { data: record, isLoading: recordLoading } = useArNSRecord(domain);
  const { data: reserved, isLoading: reservedLoading } =
    useArNSReserved(domain);

  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isReserved, setIsReserved] = useState<{
    isReserved: boolean;
    reservedFor?: ArweaveTransactionID;
  }>(defaultReserved);
  const [validated, setValidated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!domain.length) {
      reset();
      return;
    }
    setLoading(recordLoading || reservedLoading);
    if (!recordLoading && !reservedLoading) {
      setIsAvailable(!record && !reserved);
      setIsReserved({
        isReserved: !!reserved,
        reservedFor: reserved?.target
          ? new ArweaveTransactionID(reserved.target)
          : undefined,
      });
      setValidated(true);
    }
  }, [domain, record, reserved, recordLoading, reservedLoading, arioProcessId]);

  function reset() {
    setIsAvailable(false);
    setIsReserved(defaultReserved);
    setValidated(false);
  }
  return {
    isAvailable,
    isReserved: isReserved?.isReserved,
    reservedFor: isReserved?.reservedFor,
    loading,
    validated,
  };
}
