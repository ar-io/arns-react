import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useGlobalState } from '@src/state';
import { useQuery } from '@tanstack/react-query';
import Arweave from 'arweave';

export function useArBalance(address?: ArweaveTransactionID) {
  const [{ gateway }] = useGlobalState();

  return useQuery({
    queryKey: ['ar-balance', address?.toString(), gateway],
    queryFn: async () => {
      if (!address) throw new Error('No address provided');
      const arweave = new Arweave({ host: gateway, protocol: 'https' });
      const winston = await arweave.wallets.getBalance(address.toString());
      return +arweave.ar.winstonToAr(winston);
    },
    enabled: !!address,
    staleTime: 1000 * 60 * 60,
  });
}
