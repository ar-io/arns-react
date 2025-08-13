import { AoArNSNameData } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

export function useArNSRecords({
  filters,
}: {
  filters?: Partial<
    Record<
      keyof AoArNSNameData,
      string | number | boolean | string[] | number[] | boolean[]
    >
  >;
} = {}) {
  const [{ arioContract }] = useGlobalState();
  return useQuery({
    queryKey: ['arns-records', arioContract.process.processId, filters],
    queryFn: async () => {
      let hasMore = true;
      let cursor = undefined;
      const records = [];
      while (hasMore) {
        const {
          items,
          hasMore: more,
          nextCursor,
        } = await arioContract.getArNSRecords({
          filters,
          cursor,
          limit: 1000,
        });
        hasMore = more;
        cursor = nextCursor;
        records.push(...items);
      }
      return records;
    },
    staleTime: 4 * 60 * 60 * 1000, // 4 hours
  });
}
