import { ANT, ANTRecord } from '@ar.io/sdk/web';
import eventEmitter from '@src/utils/events';
// import { buildAntStateQuery } from '@src/utils/network';
// import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export function useANT(id: string) {
  // const result = useSuspenseQuery(buildAntStateQuery({ processId: id }));
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    records: Record<string, ANTRecord>;
    name: string;
    owner: string;
    ticker: string;
    controllers: string[];
  } | null>(null);

  useEffect(() => {
    const ant = ANT.init({ processId: id });
    setLoading(true);
    ant
      .getState()
      .then((state) => {
        if (state) {
          const { Records, Name, Owner, Ticker, Controllers } = state;

          setData({
            records: Records,
            name: Name,
            owner: Owner,
            ticker: Ticker,
            controllers: Controllers,
          });
        }
      })
      .catch((e) => {
        eventEmitter.emit('error', e);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return {
    ...data,
    loading,
  };
}
