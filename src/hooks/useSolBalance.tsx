import { address } from '@solana/kit';
import { useWalletState } from '@src/state';
import { getSolanaRpc } from '@src/utils/solana';
import { useQuery } from '@tanstack/react-query';

/**
 * Native SOL balance (in lamports) for the connected wallet (or an explicit
 * address). Used to gate purchase flows on having enough SOL to cover the
 * network cost (`gasEstimate.totalLamports` from `getCostDetails`).
 */
export function useSolBalance(addr?: string) {
  const [{ walletAddress }] = useWalletState();
  const userAddress = addr ?? walletAddress?.toString();

  return useQuery({
    queryKey: ['sol-balance', userAddress],
    queryFn: async () => {
      if (!userAddress) throw new Error('No address provided to fetch balance');
      const { value } = await getSolanaRpc()
        .getBalance(address(userAddress))
        .send();
      return Number(value);
    },
    enabled: !!userAddress,
    staleTime: 1000 * 30,
  });
}
