import { ANT } from '@ar.io/sdk/web';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { useGlobalState } from '../state/contexts/GlobalState';

export const rootKey = 'arns-assets';

// if wallet provided, use it to fetch ARNS assets for the wallet, else fetch all
function useARNS(walletAddress?: string) {
  const [{ arioContract }] = useGlobalState();
  const queryClient = useQueryClient();
  const res = useSuspenseQuery({
    staleTime: Infinity,
    queryKey: [rootKey, walletAddress],
    queryFn: async () => {
      const records = await arioContract.getArNSRecords();
      // get all processIds and remove duplicates
      const processIds: string[] = [
        ...new Set(Object.values(records).map((record) => record.processId)),
      ].filter((processId) => processId !== undefined);
      // process ANT data for each processId
      const antDatas = await Promise.all(
        processIds.map(async (processId: string) => {
          try {
            const ant = ANT.init({ processId });

            const controllers = await ant.getControllers();
            const {
              Owner: owner,
              Ticker: ticker,
              Name: name,
            } = await ant.getInfo();
            // return before calling more info if wallet is not owner or controller
            if (
              (walletAddress && owner !== walletAddress) ||
              (walletAddress && !controllers.includes(walletAddress))
            ) {
              return;
            }

            const undernames = await ant.getRecords();

            return {
              processId,
              owner,
              controllers,
              totalUndernames: Object.keys(undernames).filter(
                (key) => key !== '@',
              ).length,
              ticker,
              name,
            };
          } catch (error) {
            console.error('Error fetching ANT data', error);
          }
        }),
      ).then((res) =>
        res.reduce((acc, ant) => {
          if (ant) {
            const { processId, ...rest } = ant;
            acc[processId] = rest;
          }
          return acc;
        }, {} as Record<string, object>),
      );

      // process domain data
      const domains = Object.entries(records).reduce(
        (acc: Record<string, object>, [domain, record]: any) => {
          // this should filter out invalid ANT's and return only valid ones
          if (antDatas[record.processId]) {
            acc[domain] = record;
          }
          return acc;
        },
        {} as Record<string, object>,
      );
      return { domains: domains, ants: antDatas };
    },
  });

  async function invalidate(address?: string) {
    queryClient.invalidateQueries({
      queryKey: [rootKey, address],
      refetchType: 'all',
    });
  }

  return { result: res, invalidate };
}

export default useARNS;
