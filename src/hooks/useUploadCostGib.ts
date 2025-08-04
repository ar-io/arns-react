import { useGlobalState } from '@src/state';
import { GiB } from '@src/utils/constants';
import { useQuery } from '@tanstack/react-query';

import { useTurboArNSClient } from './useTurboArNSClient';

const useUploadCostGib = () => {
  const [{ turboNetwork }] = useGlobalState();
  const turbo = useTurboArNSClient();
  const res = useQuery({
    queryKey: ['uploadCostGib', turboNetwork],
    queryFn: async () => {
      if (!turbo) {
        throw Error('TurboUnauthenticatedClient is not set');
      }
      const res = await turbo.turboUploader
        .getUploadCosts({ bytes: [GiB] })
        .catch((err) => {
          console.log('err', err);
          return null;
        });
      console.log('res', res);
      return res;
    },
  });
  return res;
};

export default useUploadCostGib;
