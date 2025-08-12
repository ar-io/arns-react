import { useArNSRecord } from '../useArNSRecord';
import { useReturnedName } from '../useReturnedNames';

const RESERVED_NAMES = ['www'];

export function useRegistrationStatus(domain: string) {
  const { data: returnedName, isLoading: loadingReturnedName } =
    useReturnedName(domain);
  const { data: record, isLoading: loadingRecord } = useArNSRecord({
    name: domain,
  });

  const isReserved = RESERVED_NAMES.includes(domain);
  const isLoading = loadingReturnedName || loadingRecord;
  const isAvailable =
    returnedName === undefined && record === undefined && !isReserved;

  return {
    isAvailable,
    isReserved,
    loading: isLoading,
  };
}
