import { useWalletState } from '@src/state';
import useDomainInfo from './useDomainInfo';
import { useMarketplaceUserAssets } from './useMarketplaceUserAssets';

export interface ANTIntent {
  antId: string;
  intentId: string;
  status: 'pending' | 'resolved';
  isInterrupted?: boolean; // New field to indicate interrupted workflow
}

/**
 * Hook to detect if an ANT has a pending intent that needs resolution
 * Also detects interrupted workflows where the ANT owner matches the user but has a pending intent
 */
export function useANTIntent(antId?: string): {
  intent: ANTIntent | null;
  hasIntent: boolean;
  isInterrupted: boolean;
  isLoading: boolean;
} {
  const { data: userAssets, isLoading: assetsLoading } =
    useMarketplaceUserAssets({});
  const { data: domainInfo, isLoading: domainLoading } = useDomainInfo({
    antId,
  });
  const [{ walletAddress }] = useWalletState();

  const isLoading = assetsLoading || domainLoading;

  if (!antId || isLoading || !userAssets || !walletAddress) {
    return {
      intent: null,
      hasIntent: false,
      isInterrupted: false,
      isLoading,
    };
  }

  // Check if the ANT has any pending intents
  // Based on the marketplace user assets structure, we need to look for intents
  // The exact structure may vary, but typically intents would be in a format like:
  // userAssets.intents or userAssets.pendingIntents

  // Check multiple possible structures for intents
  const intents =
    (userAssets as any).intents ||
    (userAssets as any).pendingIntents ||
    (userAssets as any).antIntents ||
    [];

  // Also check if the ANT is in a pending state that requires intent resolution
  const _antIds = (userAssets as any).antIds || [];
  const pendingAnts = (userAssets as any).pendingAnts || [];

  // Look for explicit intent for this ANT
  const antIntent = intents.find(
    (intent: any) =>
      (intent.antId === antId || intent.processId === antId) &&
      (intent.status === 'pending' || !intent.status),
  );

  // Check if this is an interrupted workflow
  // An interrupted workflow occurs when:
  // 1. There's a pending intent for the ANT
  // 2. The ANT owner is still the same as the user (transfer didn't complete)
  const isInterruptedWorkflow =
    antIntent &&
    domainInfo?.state?.Owner === walletAddress.toString() &&
    (antIntent.status === 'pending' || !antIntent.status);

  if (antIntent) {
    return {
      intent: {
        antId,
        intentId: antIntent.id || antIntent.intentId || antIntent.messageId,
        status: antIntent.status || 'pending',
        isInterrupted: isInterruptedWorkflow,
      },
      hasIntent: true,
      isInterrupted: !!isInterruptedWorkflow,
      isLoading: false,
    };
  }

  // Check if the ANT is in a pending state (alternative structure)
  const pendingAnt = pendingAnts.find(
    (ant: any) => ant.id === antId || ant.processId === antId,
  );
  if (pendingAnt) {
    const isInterruptedPending =
      domainInfo?.state?.Owner === walletAddress.toString();

    return {
      intent: {
        antId,
        intentId: pendingAnt.intentId || pendingAnt.messageId || 'unknown',
        status: 'pending',
        isInterrupted: isInterruptedPending,
      },
      hasIntent: true,
      isInterrupted: isInterruptedPending,
      isLoading: false,
    };
  }

  return {
    intent: null,
    hasIntent: false,
    isInterrupted: false,
    isLoading: false,
  };
}
