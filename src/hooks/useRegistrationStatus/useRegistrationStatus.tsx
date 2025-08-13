import { useGlobalState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

// NOTE: this is a hard coded list, if the reserved names are ever updated (requiring a multi-sig vote) we'll need to update this
const RESERVED_NAMES = ['www'];

/**
 * This hook determines if a domain is available, returned, or reserved. It uses queries that are
 * different than the ones used in the useArNSRecord and useReturnedName hooks as we want to call them
 * in specific order and we want to avoid calling the returned name query if the name is registered.
 *
 * @param domain - The domain to check.
 * @returns An object with the registration status of the domain (e.g. isAvailable, isReturnedName, isReserved, isLoading)
 */
export function useRegistrationStatus(domain: string) {
  const [{ arioContract }] = useGlobalState();
  const isReserved = RESERVED_NAMES.includes(domain);

  // this query always runs if the name is not reserved
  const recordQuery = useQuery({
    queryKey: ['record', domain, arioContract.process.processId],
    queryFn: () => {
      if (domain.length === 0) {
        return null;
      }

      // getArNSRecord returns undefined if the name is not registered, so convert that to null for caching purposes
      return arioContract
        .getArNSRecord({ name: domain })
        .then((r) => (r === undefined ? null : r)); // null is serializable, undefined is not
    },
    enabled: !isReserved,
    staleTime: 4 * 60 * 60 * 1000,
  });

  // this query only runs if the first query returned null, which means the name is not registered
  const returnedNameQuery = useQuery({
    queryKey: ['returned-name', domain, arioContract.process.processId],
    queryFn: () => {
      if (domain.length === 0) {
        return null;
      }

      // return name API throws a 'Not found' error if the name is not returned, so we catch it and return null for caching purposes
      return arioContract
        .getArNSReturnedName({ name: domain })
        .then((r) => (r === undefined ? null : r)) // null is serializable, undefined is not
        .catch(() => {
          return null;
        });
    },
    enabled: !isReserved && !recordQuery.data && !recordQuery.isLoading,
    staleTime: 4 * 60 * 60 * 1000,
  });

  const record = recordQuery.data;
  const returnedName = returnedNameQuery.data;
  const isAvailable = !record && !returnedName && !isReserved;
  const isReturnedName = !!returnedName;

  return {
    record,
    returnedName,
    isAvailable,
    isReturnedName,
    isReserved,
    isLoading: recordQuery.isLoading || returnedNameQuery.isLoading,
  };
}
