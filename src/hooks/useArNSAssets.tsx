import { useGlobalState, useWalletState } from '@src/state';

import { useANTRegistry } from './useANTRegistry';
import { useArNSRegistryDomains } from './useArNSRegistryDomains';

/**
 * This is a composite tanstack query hook that combines
 *
 */

export function useArNSAssets({ address }: { address?: string }) {
  const [{ arioContract, aoNetwork, gateway }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();

  const { data: arnsRecords } = useArNSRegistryDomains();
  const { data: userAcl } = useANTRegistry();

  const res = useQuery({
    queryKey: ['arns-assets', arioContract, aoNetwork],
  });
}
