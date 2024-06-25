import { ANTRecord } from '@ar.io/sdk/web';
import { buildAntStateQuery } from '@src/utils/network';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export function useANT(id: string) {
  const result = useSuspenseQuery(buildAntStateQuery({ processId: id }));
  const [data, setData] = useState<{
    records: Record<string, ANTRecord>;
    name: string;
    owner: string;
    ticker: string;
    controllers: string[];
  } | null>(null);

  useEffect(() => {
    if (result.data !== null) {
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
