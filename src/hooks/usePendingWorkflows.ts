import { MarketplaceIntent } from '@ar.io/sdk';
import { useGlobalState, useWalletState } from '@src/state';
import { ANTProcessData } from '@src/state/contexts/ArNSState';
import { useMarketplaceUserAssets } from './useMarketplaceUserAssets';

export interface PendingWorkflow {
  domainName: string;
  antId: string;
  intent: MarketplaceIntent;
}

/**
 * Hook to detect pending workflows across all user domains.
 * A pending workflow is an intent with status 'pending' where:
 * - The ANT is still owned by the user (not yet transferred to marketplace)
 * - The workflow is in-progress but not yet interrupted
 */
export function usePendingWorkflows(
  ants: Record<string, ANTProcessData>,
  domains: Record<string, any>,
): {
  pendingWorkflows: PendingWorkflow[];
  isLoading: boolean;
  hasPendingWorkflows: boolean;
  getPendingWorkflowForDomain: (
    domainName: string,
    antId: string,
  ) => PendingWorkflow | undefined;
} {
  const { data: userAssets, isLoading: assetsLoading } =
    useMarketplaceUserAssets();
  const [{ walletAddress }] = useWalletState();
  const [{ marketplaceProcessId }] = useGlobalState();

  if (!userAssets || !walletAddress || assetsLoading) {
    return {
      pendingWorkflows: [],
      isLoading: assetsLoading,
      hasPendingWorkflows: false,
      getPendingWorkflowForDomain: () => undefined,
    };
  }

  const pendingWorkflows: PendingWorkflow[] = [];

  // Check intents from user assets
  const intents = userAssets.intents || [];

  // Check each domain for pending workflows
  Object.entries(domains).forEach(([domainName, record]) => {
    const antId = record.processId;
    const ant = ants[antId];

    if (!ant?.state?.Owner) return;

    // Skip if ANT is owned by marketplace (those are handled by interrupted workflows)
    if (ant.state.Owner === marketplaceProcessId) return;

    // Check if there's a pending intent for this ANT with 'pending' status
    const antIntent = intents.find(
      (intent: MarketplaceIntent) =>
        intent.antProcessId === antId && intent.status === 'pending',
    );

    // If there's a pending intent, add to pending workflows
    if (antIntent) {
      pendingWorkflows.push({
        domainName,
        antId,
        intent: antIntent,
      });
    }
  });

  const getPendingWorkflowForDomain = (
    domainName: string,
    antId: string,
  ): PendingWorkflow | undefined => {
    return pendingWorkflows.find(
      (workflow) =>
        workflow.domainName === domainName && workflow.antId === antId,
    );
  };

  return {
    pendingWorkflows,
    isLoading: false,
    hasPendingWorkflows: pendingWorkflows.length > 0,
    getPendingWorkflowForDomain,
  };
}
