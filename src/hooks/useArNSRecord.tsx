import { useGlobalState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

export function useArNSRecord({ name }: { name: string }) {
  const [{ arioContract }] = useGlobalState();

  return useQuery({
    queryKey: ['arns-record', name],
    queryFn: () => {
      if (!name) return undefined;
      return arioContract.getArNSRecord({ name }).catch(() => undefined);
    },
    enabled: !!name,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
