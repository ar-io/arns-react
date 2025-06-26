import { AoArNSNameData } from '@ar.io/sdk';
import { useWalletState } from '@src/state';
import { useQueryClient } from '@tanstack/react-query';

import { useAccessControlList } from './useAccessControlList';
import { useArNSRegistryDomains } from './useArNSRegistryDomains';

export const useDomainsForWallet = (): {
  domains: Record<string, AoArNSNameData>;
  ants: string[];
  isLoading: boolean;
  isRefetching: boolean;
  refetch: () => void;
} => {
  const queryClient = useQueryClient();
  const [{ walletAddress }] = useWalletState();
  const {
    data: arnsRecords = {},
    isLoading: isLoadingArnsRecords,
    isRefetching: isRefetchingArnsRecords,
  } = useArNSRegistryDomains();
  const {
    data: acl = {
      Owned: [],
      Controlled: [],
    },
    isLoading: isLoadingAnts,
    isRefetching: isRefetchingAnts,
  } = useAccessControlList();

  if (!walletAddress) {
    return {
      domains: {},
      ants: [],
      isLoading: false,
      isRefetching: false,
      refetch: () => void 0,
    };
  }

  // the joined set of ants the wallet owns or controls
  const flattenedACL = [...acl.Owned, ...acl.Controlled].reduce(
    (acc, processId) => {
      acc.set(processId, true);
      return acc;
    },
    new Map<string, boolean>(),
  );

  // Filter arns records to only include domains that have a processId in the wallet's list
  const filteredAntIds = new Set<string>();
  const filteredDomains = Object.entries(arnsRecords).reduce(
    (acc, [domain, record]) => {
      if (record?.processId && flattenedACL.get(record.processId)) {
        acc[domain] = record;
        filteredAntIds.add(record.processId);
      }
      return acc;
    },
    {} as Record<string, AoArNSNameData>,
  );

  return {
    isLoading: isLoadingArnsRecords || isLoadingAnts,
    refetch: () => {
      queryClient.invalidateQueries({
        queryKey: ['arnsRegistryDomains'],
      });
      queryClient.invalidateQueries({
        queryKey: ['accessControlList'],
      });
    },
    domains: filteredDomains,
    ants: Array.from(filteredAntIds),
    isRefetching: isRefetchingArnsRecords || isRefetchingAnts,
  };
};
