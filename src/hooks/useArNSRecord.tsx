import { AoArNSNameData } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/state';
import { lowerCaseDomain } from '@src/utils';
import { useQuery } from '@tanstack/react-query';

export function useArNSRecord(domain?: string) {
  const [{ arioContract, arioProcessId }] = useGlobalState();

  return useQuery<AoArNSNameData | undefined>({
    queryKey: ['arns-record', domain, arioProcessId.toString()],
    queryFn: async () => {
      if (!domain) return undefined;
      return arioContract.getArNSRecord({ name: lowerCaseDomain(domain) });
    },
    enabled: !!domain,
    staleTime: Infinity,
  });
}
