import { useGlobalState } from '@src/state';
import { isARNSDomainNameValid } from '@src/utils';
import { useQuery } from '@tanstack/react-query';

export function useArNSRecord({ name }: { name: string }) {
  const [{ arioContract }] = useGlobalState();

  return useQuery({
    queryKey: ['arns-record', name, arioContract.process.processId],
    queryFn: () => {
      if (!isARNSDomainNameValid({ name }))
        throw new Error('Invalid ArNS name');
      return arioContract.getArNSRecord({ name });
    },
    enabled: !!name && name.length > 0,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
