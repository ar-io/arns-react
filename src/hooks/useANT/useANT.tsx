import { AoANTRecord } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/state';
import { buildAntStateQuery } from '@src/utils/network';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export function useANT(id?: string) {
  const [{ antAoClient }] = useGlobalState();
  const result = useQuery(
    buildAntStateQuery({
      processId: id!,
      ao: antAoClient,
    }),
  );
  const [data, setData] = useState<{
    records: Record<string, AoANTRecord>;
    name: string;
    owner: string;
    ticker: string;
    controllers: string[];
  } | null>(null);

  useEffect(() => {
    if (result.data !== null && result.data !== undefined) {
      const { Records, Name, Owner, Ticker, Controllers } = result.data;

      setData({
        records: Records,
        name: Name,
        owner: Owner,
        ticker: Ticker,
        controllers: Controllers,
      });
    }
  }, [result.data, id]);

  return {
    ...data,
    loading: result.isLoading || result.isFetching || result.isRefetching,
  };
}
