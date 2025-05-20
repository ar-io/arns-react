import { GiB } from '@src/utils/constants';
import { useQuery } from '@tanstack/react-query';

import { useTurboArNSClient } from './useTurboArNSClient';

const useUploadCostGib = () => {
  const turbo = useTurboArNSClient();
  const res = useQuery({
    queryKey: ['uploadCostGib', turbo],
    queryFn: () => {
      if (!turbo) {
        throw Error('TurboUnauthenticatedClient is not set');
      }
      return turbo.turboUploader.getUploadCosts({ bytes: [GiB] });
    },
  });
  return res;
};

export default useUploadCostGib;
