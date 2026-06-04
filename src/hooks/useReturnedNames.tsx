import { useGlobalState } from '@src/state';
import { isARNSDomainNameValid } from '@src/utils';
import { arioContractCacheKey } from '@src/utils/sdk-init';
import { useQuery } from '@tanstack/react-query';

export function useReturnedNames() {
  const [{ arioContract }] = useGlobalState();
  return useQuery({
    queryKey: ['get-returned-names', arioContractCacheKey(arioContract)],
    queryFn: () => arioContract.getArNSReturnedNames(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useReturnedName(name?: string) {
  const [{ arioContract }] = useGlobalState();
  return useQuery({
    queryKey: ['get-returned-name', arioContractCacheKey(arioContract), name],
    queryFn: async () => {
      if (!name || !isARNSDomainNameValid({ name }))
        throw new Error('Invalid ArNS name');
      return arioContract.getArNSReturnedName({ name });
    },
    enabled: !!name && name.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}
