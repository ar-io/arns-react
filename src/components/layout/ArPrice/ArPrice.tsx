import { useEffect, useState } from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState';

function ArPrice({ data }: { data: any }) {
  const [{ arweaveDataProvider }] = useGlobalState();

  const [price, setPrice] = useState(0);
  useEffect(() => {
    getPrice();
  }, [data]);

  async function getPrice() {
    const result = await arweaveDataProvider.arPrice(data);
    setPrice(result);
  }

  return <>{price}</>;
}

export default ArPrice;
