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

      if (record === undefined) {
        throw new Error('Record not found');
      }

      return record;
    },
    enabled: !!name && name.length > 0,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
