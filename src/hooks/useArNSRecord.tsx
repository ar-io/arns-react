import { useGlobalState } from '@src/state';
import { isARNSDomainNameValid } from '@src/utils';
import { useQuery } from '@tanstack/react-query';

export function useArNSRecord({ name }: { name: string | undefined }) {
  const [{ arioContract }] = useGlobalState();

  return useQuery({
    queryKey: ['arns-record', name, arioContract.process.processId],
    queryFn: async () => {
      if (!isARNSDomainNameValid({ name }) || name === undefined)
        throw new Error('Invalid ArNS name');

      const record = await arioContract.getArNSRecord({ name });
      return record ?? null; // null is serializable, undefined is not
    },
    enabled: isARNSDomainNameValid({ name }),
    staleTime: 4 * 60 * 60 * 1000, // 4 hours
  });
}
