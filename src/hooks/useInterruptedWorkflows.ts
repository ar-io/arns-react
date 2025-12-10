import { MarketplaceIntent } from '@ar.io/sdk';
import { useWalletState } from '@src/state';
import { ANTProcessData } from '@src/state/contexts/ArNSState';
import { useMarketplaceUserAssets } from './useMarketplaceUserAssets';

export interface InterruptedWorkflow {
  domainName: string;
  antId: string;
  intentId: string;
}

/**
 * Hook to detect interrupted workflows across all user domains
 */
export function useInterruptedWorkflows(
  ants: Record<string, ANTProcessData>,
  domains: Record<string, any>,
): {
  interruptedWorkflows: InterruptedWorkflow[];
  isLoading: boolean;
  hasInterruptedWorkflows: boolean;
} {
  const { data: userAssets, isLoading: assetsLoading } =
    useMarketplaceUserAssets();
  const [{ walletAddress }] = useWalletState();

  if (!userAssets || !walletAddress || assetsLoading) {
    return {
      interruptedWorkflows: [],
      isLoading: assetsLoading,
      hasInterruptedWorkflows: false,
    };
  }

  const interruptedWorkflows: InterruptedWorkflow[] = [];

  // Check multiple possible structures for intents
  const intents = userAssets.intents || [];

  // Check each domain for interrupted workflows
  Object.entries(domains).forEach(([domainName, record]) => {
    const antId = record.processId;
    const ant = ants[antId];

    if (!ant?.state?.Owner) return;

    // Check if there's a pending intent for this ANT
    const antIntent = intents.find(
      (intent: MarketplaceIntent) =>
        intent.antProcessId === antId && intent.status === 'pending',
    );

    // If there's an intent and the ANT owner is still the user, it's interrupted
    if (antIntent && ant.state.Owner === walletAddress.toString()) {
      interruptedWorkflows.push({
        domainName,
        antId,
        intentId: antIntent.intentId,
      });
    }
  });

  return {
    interruptedWorkflows,
    isLoading: false,
    hasInterruptedWorkflows: interruptedWorkflows.length > 0,
  };
}
