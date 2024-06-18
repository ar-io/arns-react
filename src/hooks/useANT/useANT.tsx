import { ANT } from '@ar.io/sdk';
import { useEffect, useState } from 'react';

export function useANT(id: string) {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<{
    records: any;
    name: string;
    owner: string;
    ticker: string;
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

    const [records, name, owner, ticker] = await Promise.all([
      contract.getRecords(),
      contract.getName(),
      contract.getOwner(),
      contract.getTicker(),
    ]);

    return {
      records,
      name,
      owner,
      ticker,
    };
  }

  return {
    ...data,
    loading,
  };
}
