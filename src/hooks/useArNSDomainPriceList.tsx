import { useGlobalState } from '@src/state';
import { isARNSDomainNameValid, lowerCaseDomain } from '@src/utils';
import eventEmitter from '@src/utils/events';
import { useQuery } from '@tanstack/react-query';

import { useRegistrationStatus } from './useRegistrationStatus/useRegistrationStatus';
import { useTurboArNSClient } from './useTurboArNSClient';

export function useArNSDomainPriceList(domain: string) {
  const [{ arioContract, arioProcessId }] = useGlobalState();
  const turbo = useTurboArNSClient();
  const { isAvailable } = useRegistrationStatus(domain);

  return useQuery({
    queryKey: [
      `arnsDomainPriceList-${domain.length}`,
      arioProcessId.toString(),
    ],
    queryFn: async () => {
      const prices: {
        lease: number; // lease of 1 year
        buy: number; // permabuy
        turboFiatLease: number; // lease of 1 year
        turboFiatBuy: number; // permabuy
      } = {
        lease: 0,
        buy: 0,
        turboFiatLease: 0,
        turboFiatBuy: 0,
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
          const [leasePrice, buyPrice, turboFiatLease, turboFiatBuy] =
            await Promise.all([
              arioContract.getCostDetails({
                ...sharedOptions,
                years: 1,
                type: 'lease',
              }),
              arioContract.getCostDetails({
                ...sharedOptions,
                type: 'permabuy',
              }),
              turbo
                ?.getPriceForArNSIntent({
                  ...sharedOptions,
                  years: 1,
                  type: 'lease',
                })
                .then((res) => res.fiatEstimate.paymentAmount),
              turbo
                ?.getPriceForArNSIntent({
                  ...sharedOptions,
                  type: 'permabuy',
                })
                .then((res) => res.fiatEstimate.paymentAmount),
            ]);
          prices.lease = leasePrice.tokenCost;
          prices.buy = buyPrice.tokenCost;
          prices.turboFiatLease = turboFiatLease ?? 0;
          prices.turboFiatBuy = turboFiatBuy ?? 0;
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
