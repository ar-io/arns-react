import { useGlobalState } from '@src/state';
import { useQuery } from '@tanstack/react-query';
import Arweave from 'arweave';

export function useArPrice(dataSize: number) {
  const [{ gateway }] = useGlobalState();

  return useQuery({
    queryKey: ['ar-price', dataSize, gateway],
    queryFn: async () => {
      const arweave = new Arweave({ host: gateway, protocol: 'https' });
      const { data } = await arweave.api.get(`/price/${dataSize}`);
      return +arweave.ar.winstonToAr(data, { formatted: true });
    },
    staleTime: Infinity,
  });
}
