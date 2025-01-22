import { useGlobalState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

export function useReturnedNames() {
  const [{ arioContract, arioProcessId, gateway, aoNetwork }] =
    useGlobalState();
  return useQuery({
    queryKey: ['get-returned-names', arioProcessId, gateway, aoNetwork],
    queryFn: async () => {
      return await arioContract.getArNSReturnedNames();
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useReturnedName(name?: string) {
  const [{ arioContract, arioProcessId, gateway, aoNetwork }] =
    useGlobalState();

  return useQuery({
    queryKey: ['get-returned-name', arioProcessId, gateway, aoNetwork, name],
    queryFn: async () => {
      if (!name) throw new Error('Must provide name in hook');
      return await arioContract.getArNSReturnedName({ name });
    },
    staleTime: 1000 * 60 * 5,
  });
}
