import { AoANTState, AoArNSNameData } from '@ar.io/sdk/web';
import {
  buildAntStateQuery,
  buildArNSRecordsQuery,
  cacheArNSRecords,
  queryClient,
} from '@src/utils/network';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useGlobalState } from '../state/contexts/GlobalState';

export const rootKey = 'arns-assets';

// if wallet provided, use it to fetch ARNS assets for the wallet, else fetch all
function useARNS(walletAddress?: string) {
  const [{ arioContract }] = useGlobalState();
  const res = useSuspenseQuery({
    staleTime: Infinity,
    queryKey: [rootKey, walletAddress],
    queryFn: async (): Promise<{
      domains: Record<string, AoArNSNameData>;
      ants: Record<string, AoANTState>;
    }> => {
      const records = await queryClient.fetchQuery(
        buildArNSRecordsQuery({ arioContract }),
      );
      await cacheArNSRecords({ queryClient, records });
      // get all processIds and remove duplicates
      const processIds: string[] = [
        ...new Set(Object.values(records).map((record) => record.processId)),
      ].filter((processId) => processId !== undefined);
      // process ANT data for each processId

      const antDatas = await Promise.all(
        processIds.map(
          async (processId: string): Promise<[string, AoANTState]> => {
            const state = await queryClient.fetchQuery(
              buildAntStateQuery({ processId }),
            );
            return [processId, state as AoANTState] as const;
          },
        ),
      ).then((res) =>
        res.reduce((acc: Record<string, AoANTState>, [processId, state]) => {
          if (state) {
            if (
              (walletAddress && state.Owner !== walletAddress) ||
              (walletAddress &&
                state.Controllers?.length &&
                !state.Controllers.includes(walletAddress))
            ) {
              return acc;
            }
            acc[processId] = state;
          }
          return acc;
        }, {}),
      );
      // process domain data
      const domains = Object.entries(records).reduce(
        (acc: Record<string, AoArNSNameData>, [domain, record]: any) => {
          // this should filter out invalid ANT's and return only valid ones
          if (antDatas[record.processId]) {
            acc[domain] = record;
          }
          return acc;
        },
        {},
      );
      return { domains: domains, ants: antDatas };
    },
  });

  async function invalidate() {
    ['ant', 'arns-records', 'arns-record', 'arns-assets'].map((key) => {
      queryClient.invalidateQueries({
        queryKey: [key],
        refetchType: 'all',
      });
    });
  }

  return { result: res, invalidate };
}

export default useARNS;
