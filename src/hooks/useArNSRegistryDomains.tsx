import { useGlobalState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

export function useArNSRegistryDomains() {
  const [{ arioContract }] = useGlobalState();
  return useQuery({
    queryKey: ['arnsRegistryDomains'],
    queryFn: async () => {
      const domains = await arioContract.getArNSRecords({ limit: 100_000 });
      return domains;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}
