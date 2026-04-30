import { AoGateway } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/state';
import { arioContractCacheKey } from '@src/utils/sdk-init';
import { useQuery } from '@tanstack/react-query';

const useGateways = () => {
  const [{ arioContract }] = useGlobalState();

  return useQuery({
    queryKey: ['gateways', arioContractCacheKey(arioContract)],
    queryFn: async () => {
      const result = await arioContract.getGateways({ limit: 1000 });
      const gateways = result.items.reduce(
        (acc, gateway) => {
          acc[gateway.gatewayAddress] = gateway;
          return acc;
        },
        {} as Record<string, AoGateway>,
      );

      return gateways;
    },
    staleTime: 60 * 1000 * 5,
  });
};

export default useGateways;
