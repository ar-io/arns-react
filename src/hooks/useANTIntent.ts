import { MarketplaceIntent } from '@ar.io/sdk';
import { useWalletState } from '@src/state';
import useDomainInfo from './useDomainInfo';
import { useMarketplaceUserAssets } from './useMarketplaceUserAssets';

export interface ANTIntent {
  antId: string;
  intentId: string;
  status: MarketplaceIntent['status'];
  isInterrupted?: boolean; // New field to indicate interrupted workflow
}

/**
 * Hook to detect if an ANT has a pending intent that needs resolution
 * Also detects interrupted workflows where the ANT owner matches the user but has a pending intent
 */
export function useANTIntent(antId?: string): {
  intent: ANTIntent | null;
  marketplaceIntent: MarketplaceIntent | null;
  hasIntent: boolean;
  isInterrupted: boolean;
  isLoading: boolean;
} {
  const { data: userAssets, isLoading: assetsLoading } =
    useMarketplaceUserAssets({});
  const [{ walletAddress }] = useWalletState();

  if (!antId || assetsLoading || !userAssets || !walletAddress) {
    return {
      intent: null,
      marketplaceIntent: null,
      hasIntent: false,
      isInterrupted: false,
      isLoading: assetsLoading,
    };
  }

  // Check if the ANT has any intents
  // Based on the marketplace user assets structure, we need to look for intents

  const intents = userAssets.intents;

  // ANTs will only have one intent
  const antIntent = intents.find(
    (intent: MarketplaceIntent) => intent.antProcessId === antId,
  );

  // Check if this is an interrupted workflow
  // An interrupted workflow occurs when:
  // There's an intent for the ANT
  const isInterruptedWorkflow = !!antIntent;

  if (antIntent) {
    return {
      intent: {
        antId,
        intentId: antIntent.intentId,
        status: antIntent?.status,
        isInterrupted: isInterruptedWorkflow,
      },
      marketplaceIntent: antIntent,
      hasIntent: true,
      isInterrupted: !!isInterruptedWorkflow,
      isLoading: false,
    };
  }

  return {
    intent: null,
    marketplaceIntent: null,
    hasIntent: false,
    isInterrupted: false,
    isLoading: false,
  };
}
