import { ANT, AoANTState, AoArNSNameData } from '@ar.io/sdk/web';
import eventEmitter from '@src/utils/events';
// import {
//   buildAntStateQuery,
//   buildArNSRecordsQuery,
//   cacheArNSRecords,
//   queryClient,
// } from '@src/utils/network';
// import { useSuspenseQuery } from '@tanstack/react-query';
import { pLimit } from 'plimit-lit';
import { useEffect, useState } from 'react';

import { useGlobalState } from '../state/contexts/GlobalState';

export const rootKey = 'arns-assets';
const throttle = pLimit(20); // load 20 processes at a time to avoid overwhelming the browser
// if wallet provided, use it to fetch ARNS assets for the wallet, else fetch all
function useARNS(walletAddress?: string) {
  const [{ arioContract }] = useGlobalState();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching] = useState(false);
  const [data, setData] = useState<{
    domains: Record<string, AoArNSNameData>;
    ants: Record<string, AoANTState>;
  }>({ domains: {}, ants: {} });

  useEffect(() => {
    if (!isLoading && walletAddress) {
      fetchArnsData(walletAddress).then((d) => setData(d));
    }
  }, [walletAddress]);

  async function fetchArnsData(wallet: string) {
    setIsLoading(true);

    // get all ARNS records
    const records = await arioContract.getArNSRecords().catch((e) => {
      eventEmitter.emit('error', e);
    });
    if (!records) {
      setIsLoading(false);
      return { domains: {}, ants: {} };
    }

    const domains: Record<string, AoArNSNameData> = {};
    const ants: Record<string, AoANTState> = {};
    try {
      // set domain and ant data
      await Promise.all(
        Object.entries(records).map(async ([domain, record]) => {
          await throttle(async () => {
            const ant = ANT.init({ processId: record.processId });
            const state = await ant.getState();
            if (state) {
              if (
                state.Owner !== wallet ||
                (state.Controllers?.length &&
                  !state.Controllers.includes(wallet))
              ) {
                return;
              }
              ants[record.processId] = state;
              domains[domain] = record;
            }
          });
        }),
      );
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setIsLoading(false);
    }

    return { domains, ants };
  }

  async function invalidate() {
    // TODO: implement this with caching
    return;
    // ['ant', 'arns-records', 'arns-record', 'arns-assets', 'io-balance'].map(
    //   (key) => {
    //     queryClient.invalidateQueries({
    //       queryKey: [key],
    //       refetchType: 'all',
    //     });
    //   },
    // );
  }

  // returning in this format to avoid refactoring other point of integration with the caching logic
  return {
    result: { data, isLoading, isFetching, isRefetching: false },
    invalidate,
  };
}

export default useARNS;
