import { AoGateway } from '@ar.io/sdk';
import { useGlobalState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

const useGateways = () => {
  const [{ arioContract }] = useGlobalState();

  return useQuery({
    queryKey: ['gateways'],
    queryFn: async () => {
      const result = await arioContract.getGateways({ limit: 10_000 });
      const gateways = result.items.reduce((acc, gateway) => {
        acc[gateway.gatewayAddress] = gateway;
        return acc;
      }, {} as Record<string, AoGateway>);

      return gateways;
    },
    staleTime: 60 * 1000 * 5, // 5 minutes
  });
};

export default useGateways;
