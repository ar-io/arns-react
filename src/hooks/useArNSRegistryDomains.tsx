import { fetchAllArNSRecords } from '@ar.io/sdk';
import { useGlobalState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

export function useArNSRegistryDomains() {
  const [{ arioContract, arioProcessId }] = useGlobalState();
  return useQuery({
    queryKey: ['arnsRegistryDomains', arioProcessId.toString()],
    queryFn: async () => {
      const domains = await fetchAllArNSRecords({
        contract: arioContract,
        pageSize: 1000,
      });
      return domains;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
