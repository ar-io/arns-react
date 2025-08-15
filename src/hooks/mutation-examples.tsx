/**
 * Examples showing how to migrate from direct dispatchArIOInteraction calls
 * to the new mutation hooks with integrated cache management
 */
import { AoARIOWrite } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { useTransactionState } from '@src/state/contexts/TransactionState';
import { useWalletState } from '@src/state/contexts/WalletState';
import { ARNS_INTERACTION_TYPES, FundFrom } from '@src/types';
import React from 'react';

import {
  useBuyRecord,
  useEnhancedArIOInteraction,
  useExtendLease,
  useIncreaseUndernames,
  useUpgradeName,
} from './index';

// Example 1: Buy Record with specific mutation hook
function BuyRecordExample() {
  const [{ arioContract, arioProcessId, ao, antAo, hyperbeamUrl }] =
    useGlobalState();
  const [{ dispatch }] = useTransactionState();
  const [{ wallet, walletAddress }] = useWalletState();

  const buyRecordMutation = useBuyRecord();

  const handleBuyRecord = async (domainName: string, years: number) => {
    if (!wallet?.contractSigner || !walletAddress) return;

    try {
      await buyRecordMutation.mutateAsync({
        name: domainName,
        type: 'lease',
        years,
        owner: walletAddress,
        arioContract: arioContract as AoARIOWrite,
        processId: arioProcessId,
        dispatch,
        signer: wallet.contractSigner,
        ao,
        antAo,
        hyperbeamUrl,
        fundFrom: 'balance' as FundFrom,
      });

      console.log('Record purchased successfully!');
    } catch (error) {
      console.error('Failed to purchase record:', error);
    }
  };

  return (
    <button
      onClick={() => handleBuyRecord('example-domain', 1)}
      disabled={buyRecordMutation.isPending}
    >
      {buyRecordMutation.isPending ? 'Buying...' : 'Buy Record'}
    </button>
  );
}

// Example 2: Using the enhanced wrapper for any interaction type
function EnhancedInteractionExample() {
  const [{ arioContract, arioProcessId, ao, antAo, hyperbeamUrl }] =
    useGlobalState();
  const [{ dispatch }] = useTransactionState();
  const [{ wallet, walletAddress }] = useWalletState();

  const enhancedInteraction = useEnhancedArIOInteraction();

  const handleExtendLease = async (domainName: string, years: number) => {
    if (!wallet?.contractSigner || !walletAddress) return;

    try {
      await enhancedInteraction.mutateAsync({
        payload: {
          name: domainName,
          years,
        },
        workflowName: ARNS_INTERACTION_TYPES.EXTEND_LEASE,
        owner: walletAddress,
        arioContract: arioContract as AoARIOWrite,
        processId: arioProcessId,
        dispatch,
        signer: wallet.contractSigner,
        ao,
        antAo,
        hyperbeamUrl,
        fundFrom: 'balance' as FundFrom,
      });

      console.log('Lease extended successfully!');
    } catch (error) {
      console.error('Failed to extend lease:', error);
    }
  };

  return (
    <button
      onClick={() => handleExtendLease('example-domain', 1)}
      disabled={enhancedInteraction.isPending}
    >
      {enhancedInteraction.isPending ? 'Extending...' : 'Extend Lease'}
    </button>
  );
}

// Example 3: Migration pattern for existing components
function MigrationExample() {
  const [{ arioContract, arioProcessId, ao, antAo, hyperbeamUrl }] =
    useGlobalState();
  const [{ dispatch }] = useTransactionState();
  const [{ wallet, walletAddress }] = useWalletState();

  const upgradeMutation = useUpgradeName();

  // BEFORE: Direct dispatchArIOInteraction call
  /*
  const handleUpgrade = async () => {
    await dispatchArIOInteraction({
      payload: { name: 'example-domain' },
      workflowName: ARNS_INTERACTION_TYPES.UPGRADE_NAME,
      owner: walletAddress,
      arioContract: arioContract as AoARIOWrite,
      processId: arioProcessId,
      dispatch,
      signer: wallet.contractSigner,
      ao,
      antAo,
      hyperbeamUrl,
      fundFrom: 'balance' as FundFrom,
    });
  };
  */

  // AFTER: Using mutation hook with optimistic updates and better cache management
  const handleUpgrade = async () => {
    if (!wallet?.contractSigner || !walletAddress) return;

    try {
      await upgradeMutation.mutateAsync({
        name: 'example-domain',
        owner: walletAddress,
        arioContract: arioContract as AoARIOWrite,
        processId: arioProcessId,
        dispatch,
        signer: wallet.contractSigner,
        ao,
        antAo,
        hyperbeamUrl,
        fundFrom: 'balance' as FundFrom,
      });
    } catch (error) {
      // Error handling is built into the mutation
      console.error('Upgrade failed:', error);
    }
  };

  return (
    <button onClick={handleUpgrade} disabled={upgradeMutation.isPending}>
      {upgradeMutation.isPending ? 'Upgrading...' : 'Upgrade to Permabuy'}
    </button>
  );
}

// Example 4: Multiple mutations in a component with shared state
function ComprehensiveMutationsExample() {
  const [{ arioContract, arioProcessId, ao, antAo, hyperbeamUrl }] =
    useGlobalState();
  const [{ dispatch }] = useTransactionState();
  const [{ wallet, walletAddress }] = useWalletState();

  const buyRecord = useBuyRecord();
  const extendLease = useExtendLease();
  const upgradeName = useUpgradeName();
  const increaseUndernames = useIncreaseUndernames();

  // Check if any mutation is pending
  const isAnyMutationPending = [
    buyRecord,
    extendLease,
    upgradeName,
    increaseUndernames,
  ].some((mutation) => mutation.isPending);

  const baseParams = {
    owner: walletAddress!,
    arioContract: arioContract as AoARIOWrite,
    processId: arioProcessId,
    dispatch,
    signer: wallet?.contractSigner!,
    ao,
    antAo,
    hyperbeamUrl,
    fundFrom: 'balance' as FundFrom,
  };

  return (
    <div>
      <button
        onClick={() =>
          buyRecord.mutateAsync({
            ...baseParams,
            name: 'new-domain',
            type: 'lease',
            years: 1,
          })
        }
        disabled={isAnyMutationPending}
      >
        Buy Record
      </button>

      <button
        onClick={() =>
          extendLease.mutateAsync({
            ...baseParams,
            name: 'existing-domain',
            years: 1,
          })
        }
        disabled={isAnyMutationPending}
      >
        Extend Lease
      </button>

      <button
        onClick={() =>
          upgradeName.mutateAsync({
            ...baseParams,
            name: 'existing-domain',
          })
        }
        disabled={isAnyMutationPending}
      >
        Upgrade to Permabuy
      </button>

      <button
        onClick={() =>
          increaseUndernames.mutateAsync({
            ...baseParams,
            name: 'existing-domain',
            qty: 10,
          })
        }
        disabled={isAnyMutationPending}
      >
        Increase Undernames
      </button>

      {/* Show loading state */}
      {isAnyMutationPending && <div>Processing transaction...</div>}
    </div>
  );
}

export {
  BuyRecordExample,
  EnhancedInteractionExample,
  MigrationExample,
  ComprehensiveMutationsExample,
};
