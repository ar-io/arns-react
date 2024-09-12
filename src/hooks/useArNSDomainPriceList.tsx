import { useGlobalState } from '@src/state';
import { isARNSDomainNameValid, lowerCaseDomain } from '@src/utils';
import eventEmitter from '@src/utils/events';
import { useQuery } from '@tanstack/react-query';

export function useArNSDomainPriceList(domain: string) {
  const [{ arioContract, ioProcessId }] = useGlobalState();

  return useQuery({
    queryKey: [`arnsDomainPriceList-${domain.length}`, ioProcessId.toString()],
    queryFn: async () => {
      const prices: {
        lease: number; // lease of 1 year
        buy: number; // permabuy
      } = {
        lease: 0,
        buy: 0,
      };
      try {
        if (
          domain &&
          domain.length > 0 &&
          isARNSDomainNameValid({ name: domain })
        ) {
          const sharedOptions: any = {
            intent: 'Buy-Record',
            name: lowerCaseDomain(domain),
          };
          const [leasePrice, buyPrice] = await Promise.all([
            arioContract.getTokenCost({
              ...sharedOptions,
              years: 1,
              purchaseType: 'lease',
            }),
            arioContract.getTokenCost({
              ...sharedOptions,
              purchaseType: 'permabuy',
            }),
          ]);
          prices.lease = leasePrice;
          prices.buy = buyPrice;
        }
      } catch (error) {
        eventEmitter.emit('error', {
          message: `Failed to fetch price for domain: ${domain}`,
          name: 'Domain Price',
        });
      }
      return prices;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}
