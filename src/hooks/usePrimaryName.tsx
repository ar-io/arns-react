import { useGlobalState, useWalletState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

export function usePrimaryName() {
  const [{ walletAddress }] = useWalletState();
  const [{ arioContract }] = useGlobalState();
  // `arioContract.process.processId` only exists on the AO backend
  // (`ARIOReadable`/`ARIOWriteable`); the Solana variants don't expose a
  // `process` and reading `.processId` off `undefined` crashes React mid-
  // render. Fall back to a stable string so the queryKey still differentiates
  // between an unset client and the Solana client.
  const arioCacheKey =
    (arioContract as { process?: { processId?: string } } | undefined)?.process
      ?.processId ?? (arioContract ? 'solana' : 'none');
  return useQuery({
    queryKey: ['primary-name', walletAddress?.toString(), arioCacheKey],
    queryFn: async () => {
      if (!walletAddress)
        throw new Error('Must be connected to retrieve primary name');
      const primaryNameData = await arioContract
        .getPrimaryName({
          address: walletAddress?.toString(),
        })
        .catch(() => {
          // no name returned, return null
          return null;
        });

      return primaryNameData;
    },
    staleTime: 1 * 60 * 60 * 1000, // 1 hour
    enabled: walletAddress !== undefined && arioContract !== undefined,
  });
}
