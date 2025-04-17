import { PAYMENT_SERVICE_FQDN } from '@src/utils/constants';
import { useQuery } from '@tanstack/react-query';

const serviceURL = `https://${PAYMENT_SERVICE_FQDN}/v1/countries`;

const useCountries = () => {
  const res = useQuery({
    queryKey: ['countries'],
    queryFn: () => {
      return fetch(serviceURL).then((res) => res.json() as Promise<string[]>);
    },
  });

  return res;
};

export default useCountries;
