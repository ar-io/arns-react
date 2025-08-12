import { useGlobalState } from '@src/state';
import { isARNSDomainNameValid } from '@src/utils';
import { useQuery } from '@tanstack/react-query';

export function useReturnedNames() {
  const [{ arioContract, arioProcessId, aoNetwork }] = useGlobalState();
  return useQuery({
    queryKey: ['get-returned-names', arioProcessId, aoNetwork],
    queryFn: () => {
      return arioContract.getArNSReturnedNames();
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useReturnedName(name?: string) {
  const [{ arioContract, arioProcessId, aoNetwork }] = useGlobalState();

  return useQuery({
    queryKey: ['get-returned-name', arioProcessId, aoNetwork, name],
    queryFn: async () => {
      if (!name || !isARNSDomainNameValid({ name }))
        throw new Error('Invalid ArNS name');
      return arioContract.getArNSReturnedName({ name });
    },
    enabled: !!name && name.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}
