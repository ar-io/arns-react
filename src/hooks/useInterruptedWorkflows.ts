import { MarketplaceIntent } from '@ar.io/sdk';
import { useGlobalState, useWalletState } from '@src/state';
import { ANTProcessData } from '@src/state/contexts/ArNSState';
import { useMarketplaceUserAssets } from './useMarketplaceUserAssets';

/**
 * Types of interrupted workflows that can be detected and resolved
 */
export enum InterruptedWorkflowType {
  // ANT is still owned by user but has a pending intent - need to transfer to marketplace
  TRANSFER = 'transfer',
  // ANT is owned by marketplace but order wasn't created - need to push intent resolution
  PUSH_INTENT = 'push_intent',
  // Unknown state - ANT is owned by someone other than user or marketplace
  UNKNOWN = 'unknown',
}

export interface InterruptedWorkflow {
  domainName: string;
  antId: string;
  intent: MarketplaceIntent;
  workflowType: InterruptedWorkflowType;
}

/**
 * Hook to detect interrupted workflows across all user domains.
 * Determines the workflow type based on ANT ownership:
 * - TRANSFER: ANT is owned by user but has a pending intent
 * - PUSH_INTENT: ANT is owned by marketplace but order wasn't created
 * - UNKNOWN: ANT is owned by someone else (error state requiring team intervention)
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
  const [{ marketplaceProcessId }] = useGlobalState();

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
  const userAddress = walletAddress.toString();

  // Check each domain for interrupted workflows
  Object.entries(domains).forEach(([domainName, record]) => {
    const antId = record.processId;
    const ant = ants[antId];

    if (!ant?.state?.Owner) return;

    const antOwner = ant.state.Owner;

    // Check if there's a pending intent for this ANT
    const antIntent = intents.find(
      (intent: MarketplaceIntent) => intent.antProcessId === antId,
    );

    // If there's an intent, determine the workflow type based on ownership
    if (antIntent) {
      let workflowType: InterruptedWorkflowType;

      if (antOwner === marketplaceProcessId) {
        // ANT is owned by marketplace but has an intent - needs push intent resolution
        workflowType = InterruptedWorkflowType.PUSH_INTENT;
      } else if (antOwner === userAddress) {
        // ANT is still owned by user - needs transfer to marketplace
        workflowType = InterruptedWorkflowType.TRANSFER;
      } else {
        // ANT is owned by someone else - unknown/error state
        workflowType = InterruptedWorkflowType.UNKNOWN;
      }

      interruptedWorkflows.push({
        domainName,
        antId,
        intent: antIntent,
        workflowType,
      });
    }
  });

  return {
    interruptedWorkflows,
    isLoading: false,
    hasInterruptedWorkflows: interruptedWorkflows.length > 0,
  };
}
