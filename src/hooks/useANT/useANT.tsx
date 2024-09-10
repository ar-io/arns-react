import { AoANTRecord } from '@ar.io/sdk/web';
import { buildAntStateQuery } from '@src/utils/network';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export function useANT(id?: string) {
  const result = useQuery(buildAntStateQuery({ processId: id }));
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
