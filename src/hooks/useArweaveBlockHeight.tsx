import { useGlobalState } from '@src/state';
import { useQuery } from '@tanstack/react-query';
import Arweave from 'arweave';

export function useArweaveBlockHeight() {
  const [{ gateway }] = useGlobalState();

  return useQuery({
    queryKey: ['block-height', gateway],
    queryFn: async () => {
      const arweave = new Arweave({ host: gateway, protocol: 'https' });
      return (await arweave.blocks.getCurrent()).height;
    },
    staleTime: 1000 * 60,
  });
}
