import { useEffect, useState } from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState';

function ArPrice({ dataSize }: { dataSize: number }) {
  const [{ arweaveDataProvider }] = useGlobalState();

  const [price, setPrice] = useState(0);
  useEffect(() => {
    getPrice();
  }, [dataSize]);

  async function getPrice() {
    const result = await arweaveDataProvider.getArPrice(dataSize);
    setPrice(result);
  }

  return <>{`${price} AR`}</>;
}

export default ArPrice;
