import { AoArNSNameData } from '@ar.io/sdk';
import { useGlobalState, useWalletState } from '@src/state';
import { UseQueryResult, useQuery } from '@tanstack/react-query';

export const useDomainsForWallet = (): UseQueryResult<
  Record<string, AoArNSNameData>
> => {
  const [{ walletAddress }] = useWalletState();
  const [{ arioContract }] = useGlobalState();
  return useQuery({
    queryKey: ['arns-records-for-wallet', walletAddress?.toString()],
    queryFn: async () => {
      let cursor: string | undefined = undefined;
      const arnsRecordsForWallet: Record<string, AoArNSNameData> = {};
      let hasMore = true;
      while (hasMore) {
        const {
          items: newRecords,
          hasMore: nextHasMore,
          nextCursor,
        } = await arioContract.getArNSRecordsForAddress({
          address: walletAddress?.toString() ?? '',
          cursor,
        });
        newRecords.forEach((record) => {
          arnsRecordsForWallet[record.name] = record;
        });
        if (!nextHasMore) {
          break;
        }
        hasMore = nextHasMore;
        cursor = nextCursor;
      }
      return arnsRecordsForWallet;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};
