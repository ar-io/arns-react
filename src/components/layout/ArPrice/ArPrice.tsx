import { useArPrice } from '@src/hooks';
import { useEffect } from 'react';

import eventEmitter from '../../../utils/events';

function ArPrice({ dataSize }: { dataSize: number }) {
  const { data, error } = useArPrice(dataSize);

  useEffect(() => {
    if (error) {
      eventEmitter.emit('error', error);
    }
  }, [error]);

  return <>{`${(data ?? 0).toPrecision(8)} AR`}</>;
}

export default ArPrice;
