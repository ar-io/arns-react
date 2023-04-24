import { useEffect, useState } from 'react';

import { useArweaveCompositeProvider } from '../../../hooks';

function ArPrice({ dataSize }: { dataSize: number }) {
  const arweaveDataProvider = useArweaveCompositeProvider();

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
