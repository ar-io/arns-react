import { ANT, ANTRecord } from '@ar.io/sdk/web';
import { useEffect, useState } from 'react';

export function useANT(id: string) {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<{
    records: Record<string, ANTRecord>;
    name: string;
    owner: string;
    ticker: string;
    controllers: string[];
  } | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchAntData(id)
      .then((data) => {
        setData(data);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  async function fetchAntData(id: string) {
    const contract = ANT.init({
      processId: id,
    });

    const [records, name, owner, ticker, controllers = []] = await Promise.all([
      contract.getRecords(),
      contract.getName(),
      contract.getOwner(),
      contract.getTicker(),
      contract.getControllers(),
    ]);

    return {
      records,
      name,
      owner,
      ticker,
      controllers,
    };
  }

  return {
    ...data,
    loading,
  };
}
