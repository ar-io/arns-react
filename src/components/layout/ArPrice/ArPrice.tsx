import { useEffect, useState } from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import eventEmitter from '../../../utils/events';

function ArPrice({ dataSize }: { dataSize: number }) {
  const [{ arweaveDataProvider }] = useGlobalState();

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

  return <>{`${price.toPrecision(8)} AR`}</>;
}

export default ArPrice;
