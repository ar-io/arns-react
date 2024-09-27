import { useGlobalState } from '@src/state';
import { isARNSDomainNameValid } from '@src/utils';
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
          const fees = await arioContract.getRegistrationFees();
          prices.lease = fees[domain.length].lease[1]; // 1 year lease
          prices.buy = fees[domain.length].permabuy;
        }
      } catch (error) {
        eventEmitter.emit('error', {
          message: `Failed to fetch price for domain: ${domain}`,
          name: 'Domain Price',
        });
      }
      return prices;
    },
    staleTime: 60 * 1000 * 5, // 5 minutes ~ demand factor changes once daily.
    // TODO: use stale time as next demand factor timestamp - current timestamp
  });
}
