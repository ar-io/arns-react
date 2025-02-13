import { AoGateway } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

const useGateways = () => {
  const [{ arioContract, arioProcessId }] = useGlobalState();

  return useQuery({
    queryKey: ['gateways', arioProcessId?.toString()],
    queryFn: async () => {
      const result = await arioContract.getGateways({ limit: 1000 });
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
