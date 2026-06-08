import { useGlobalState } from '@src/state';
import { isARNSDomainNameValid, lowerCaseDomain } from '@src/utils';
import eventEmitter from '@src/utils/events';
import { arioContractCacheKey } from '@src/utils/sdk-init';
import { useQuery } from '@tanstack/react-query';

import { useRegistrationStatus } from './useRegistrationStatus/useRegistrationStatus';

export function useArNSDomainPriceList(domain: string) {
  const [{ arioContract }] = useGlobalState();
  const { isAvailable } = useRegistrationStatus(domain);

  return useQuery({
    queryKey: [
      `arnsDomainPriceList-${domain.length}`,
      arioContractCacheKey(arioContract),
    ],
    queryFn: async () => {
      const prices: {
        lease: number; // lease of 1 year, in mARIO
        buy: number; // permabuy, in mARIO
      } = {
        lease: 0,
        buy: 0,
      };
      try {
        if (
          isAvailable &&
          domain &&
          domain.length > 0 &&
          isARNSDomainNameValid({ name: domain })
        ) {
          const sharedOptions: any = {
            intent: 'Buy-Name',
            name: lowerCaseDomain(domain),
          };
          const [leasePrice, buyPrice] = await Promise.all([
            arioContract.getCostDetails({
              ...sharedOptions,
              years: 1,
              type: 'lease',
            }),
            arioContract.getCostDetails({
              ...sharedOptions,
              type: 'permabuy',
            }),
          ]);
          prices.lease = leasePrice.tokenCost;
          prices.buy = buyPrice.tokenCost;
        }
      } catch (_error) {
        eventEmitter.emit('error', {
          message: `Failed to fetch price for domain: ${domain}`,
          name: 'Domain Price',
        });
      }
      return prices;
    },
    staleTime: 1000 * 60 * 60 * 4, // 4 hours ~ demand factor changes once daily.
    enabled: isAvailable && domain.length > 0,
  });
}
