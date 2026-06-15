import { GasEstimate, SolanaANTReadable } from '@ar.io/sdk/web';
import { getActiveSolanaConfig, getSolanaRpc } from '@src/utils/solana';
import { useQuery } from '@tanstack/react-query';

export type AntGasWorkflowParams = Parameters<
  SolanaANTReadable['getGasEstimate']
>[0];

/**
 * Quote the Solana network cost (fees + rent created, and rent reclaimed by
 * closes) for an ANT management action — add/edit/remove undername,
 * transfer, reassign. Pairs with `useSolBalance` to gate confirm buttons.
 */
export function useAntGasEstimate(params: {
  processId?: string;
  workflow?: AntGasWorkflowParams;
}) {
  return useQuery<GasEstimate>({
    queryKey: ['ant-gas-estimate', params.processId, params.workflow],
    queryFn: async () => {
      const { programIds } = getActiveSolanaConfig();
      const ant = new SolanaANTReadable({
        rpc: getSolanaRpc(),
        processId: params.processId as string,
        antProgramId: programIds.antProgramId,
      });
      return ant.getGasEstimate(params.workflow as AntGasWorkflowParams);
    },
    enabled: !!params.processId && !!params.workflow,
    staleTime: 1000 * 60,
  });
}
