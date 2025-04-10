import { Currency } from '@ardrive/turbo-sdk/web';
import { useQuery } from '@tanstack/react-query';

import { useTurboArNSClient } from './useTurboArNSClient';

const useFiatToAR = (currency: Currency = 'usd') => {
  const turbo = useTurboArNSClient();
  const res = useQuery({
    queryKey: ['fiatToAr', currency],
    queryFn: () => {
      if (!turbo?.turboUploader) {
        throw Error('TurboUnauthenticatedClient is not set');
      }
      return turbo.turboUploader.getFiatToAR({ currency });
    },
  });
  return res;
};

export default useFiatToAR;
