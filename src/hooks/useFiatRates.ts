import { useQuery } from '@tanstack/react-query';

import { useTurboArNSClient } from './useTurboArNSClient';

const useFiatRates = () => {
  const turbo = useTurboArNSClient();
  const res = useQuery({
    queryKey: ['fiatRates'],
    queryFn: () => {
      if (!turbo?.turboUploader) {
        throw Error('TurboUnauthenticatedClient is not set');
      }

      return turbo.turboUploader.getFiatRates();
    },
  });
  return res;
};

export default useFiatRates;
