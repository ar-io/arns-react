import { useEffect, useState } from 'react';

import { useArweaveCompositeProvider } from '../../../hooks';
import eventEmitter from '../../../utils/events';

function ArPrice({ dataSize }: { dataSize: number }) {
  const arweaveDataProvider = useArweaveCompositeProvider();

  const [price, setPrice] = useState(0);
  useEffect(() => {
    getPrice();
  }, [dataSize]);

  async function getPrice() {
    const result = await arweaveDataProvider.getArPrice(dataSize);
    try {
      if (!result) {
        throw new Error('Could not get price on gas fee');
      }
      setPrice(result);
    } catch (error: any) {
      eventEmitter.emit(error);
      setPrice(0);
    }
  }

  return <>{`${price} AR`}</>;
}

export default ArPrice;
