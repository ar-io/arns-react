import { useGlobalState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

export function useArNSReserved(domain?: string) {
  const [{ arioContract, arioProcessId }] = useGlobalState();

  return useQuery({
    queryKey: ['arns-reserved', domain, arioProcessId.toString()],
    queryFn: async () => {
      if (!domain) return null;
      return arioContract.getArNSReservedName({ name: domain });
    },
    enabled: !!domain,
    staleTime: Infinity,
  });
}
