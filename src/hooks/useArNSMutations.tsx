import {
  AoARIOWrite,
  AoArNSNameData,
  AoClient,
  ContractSigner,
  FundFrom,
} from '@ar.io/sdk/web';
import { TurboArNSClient } from '@src/services/turbo/TurboArNSClient';
import dispatchArIOInteraction from '@src/state/actions/dispatchArIOInteraction';
import { TransactionAction } from '@src/state/reducers/TransactionReducer';
import {
  ARNS_INTERACTION_TYPES,
  AoAddress,
  ContractInteraction,
} from '@src/types';
import { lowerCaseDomain } from '@src/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dispatch } from 'react';

import {
  arnsQueryKeys,
  invalidateRelatedQueries,
  updateCollectionQueries,
} from './index';

/**
 * Enhanced mutation hook for ArNS operations with smart cache management
 * Integrates with the existing dispatchArIOInteraction pattern while adding
 * optimistic updates and efficient cache synchronization
 */

interface ArNSMutationParams {
  arioContract: AoARIOWrite;
  processId: string;
  owner: AoAddress;
  dispatch: Dispatch<TransactionAction>;
  signer: ContractSigner;
  ao?: AoClient;
  antAo?: AoClient;
  hyperbeamUrl?: string;
  scheduler?: string;
  fundFrom?: FundFrom | 'fiat';
  turboArNSClient?: TurboArNSClient;
}

interface BuyRecordParams extends ArNSMutationParams {
  name: string;
  type: 'lease' | 'permabuy';
  years: number;
  paymentMethodId?: string;
  email?: string;
  antProcessId?: string;
}

interface ExtendLeaseParams extends ArNSMutationParams {
  name: string;
  years: number;
  paymentMethodId?: string;
  email?: string;
}

interface UpgradeNameParams extends ArNSMutationParams {
  name: string;
  paymentMethodId?: string;
  email?: string;
}

interface IncreaseUndernamesParams extends ArNSMutationParams {
  name: string;
  qty: number;
  paymentMethodId?: string;
  email?: string;
}

/**
 * Hook for buying ArNS records with optimistic updates
 */
export function useBuyRecord() {
  const queryClient = useQueryClient();

  return useMutation<ContractInteraction, Error, BuyRecordParams>({
    mutationFn: async (params) => {
      return await dispatchArIOInteraction({
        payload: {
          name: params.name,
          type: params.type,
          years: params.years,
          paymentMethodId: params.paymentMethodId,
          email: params.email,
          processId: params.antProcessId || 'atomic',
        },
        workflowName: ARNS_INTERACTION_TYPES.BUY_RECORD,
        owner: params.owner,
        arioContract: params.arioContract,
        processId: params.processId,
        dispatch: params.dispatch,
        signer: params.signer,
        ao: params.ao,
        antAo: params.antAo,
        hyperbeamUrl: params.hyperbeamUrl,
        scheduler: params.scheduler,
        fundFrom: params.fundFrom,
        turboArNSClient: params.turboArNSClient,
      });
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: arnsQueryKeys.record(variables.processId, variables.name),
      });

      // Optimistically update individual record
      const optimisticRecord: Partial<AoArNSNameData> = {
        processId: variables.antProcessId || 'pending',
        type: variables.type,
        startTimestamp: Date.now() / 1000,
        undernameLimit: 10, // default
        purchasePrice: 0, // will be updated after successful transaction
      };

      queryClient.setQueryData(
        arnsQueryKeys.record(variables.processId, variables.name),
        optimisticRecord,
      );

      return { previousRecord: null }; // Store for rollback if needed
    },
    onSuccess: async (result, variables) => {
      // After successful transaction, we need to:
      // 1. Fetch the fresh record data
      // 2. Update all related collection queries
      // 3. Invalidate user's records to trigger refetch

      try {
        // Wait a bit for the transaction to be processed
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Invalidate related queries to trigger fresh fetches
        invalidateRelatedQueries(
          queryClient,
          variables.processId,
          variables.name,
        );

        // Specifically invalidate user's records
        queryClient.invalidateQueries({
          queryKey: arnsQueryKeys.recordsForAddress(
            variables.processId,
            variables.owner.toString(),
          ),
        });

        // Note: We don't need to manually update the cache here because
        // the invalidation will trigger fresh fetches that will populate
        // the cache with the real data
      } catch (error) {
        console.error('Error updating cache after buy record:', error);
      }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousRecord) {
        queryClient.setQueryData(
          arnsQueryKeys.record(variables.processId, variables.name),
          context.previousRecord,
        );
      } else {
        // Remove the optimistic record
        queryClient.removeQueries({
          queryKey: arnsQueryKeys.record(variables.processId, variables.name),
        });
      }
    },
  });
}

/**
 * Hook for extending ArNS record leases
 */
export function useExtendLease() {
  const queryClient = useQueryClient();

  return useMutation<ContractInteraction, Error, ExtendLeaseParams>({
    mutationFn: async (params) => {
      return await dispatchArIOInteraction({
        payload: {
          name: params.name,
          years: params.years,
          paymentMethodId: params.paymentMethodId,
          email: params.email,
        },
        workflowName: ARNS_INTERACTION_TYPES.EXTEND_LEASE,
        owner: params.owner,
        arioContract: params.arioContract,
        processId: params.processId,
        dispatch: params.dispatch,
        signer: params.signer,
        ao: params.ao,
        antAo: params.antAo,
        hyperbeamUrl: params.hyperbeamUrl,
        scheduler: params.scheduler,
        fundFrom: params.fundFrom,
        turboArNSClient: params.turboArNSClient,
      });
    },
    onSuccess: async (result, variables) => {
      // For extend lease, we want to optimistically update the record's expiration
      // but since we don't have the exact new expiration date, it's safer to just invalidate

      await new Promise((resolve) => setTimeout(resolve, 1500));

      invalidateRelatedQueries(
        queryClient,
        variables.processId,
        variables.name,
      );
    },
  });
}

/**
 * Hook for upgrading names to permabuy
 */
export function useUpgradeName() {
  const queryClient = useQueryClient();

  return useMutation<ContractInteraction, Error, UpgradeNameParams>({
    mutationFn: async (params) => {
      return await dispatchArIOInteraction({
        payload: {
          name: params.name,
          paymentMethodId: params.paymentMethodId,
          email: params.email,
        },
        workflowName: ARNS_INTERACTION_TYPES.UPGRADE_NAME,
        owner: params.owner,
        arioContract: params.arioContract,
        processId: params.processId,
        dispatch: params.dispatch,
        signer: params.signer,
        ao: params.ao,
        antAo: params.antAo,
        hyperbeamUrl: params.hyperbeamUrl,
        scheduler: params.scheduler,
        fundFrom: params.fundFrom,
        turboArNSClient: params.turboArNSClient,
      });
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: arnsQueryKeys.record(variables.processId, variables.name),
      });

      // Get the current record
      const currentRecord = queryClient.getQueryData<AoArNSNameData>(
        arnsQueryKeys.record(variables.processId, variables.name),
      );

      if (currentRecord) {
        // Optimistically update to permabuy
        const updatedRecord: AoArNSNameData = {
          ...currentRecord,
          type: 'permabuy',
        };

        queryClient.setQueryData(
          arnsQueryKeys.record(variables.processId, variables.name),
          updatedRecord,
        );

        // Update collection queries too
        updateCollectionQueries(
          queryClient,
          variables.processId,
          updatedRecord,
          variables.name,
        );
      }

      return { previousRecord: currentRecord };
    },
    onSuccess: async (result, variables) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      invalidateRelatedQueries(
        queryClient,
        variables.processId,
        variables.name,
      );
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousRecord) {
        queryClient.setQueryData(
          arnsQueryKeys.record(variables.processId, variables.name),
          context.previousRecord,
        );
        updateCollectionQueries(
          queryClient,
          variables.processId,
          context.previousRecord,
          variables.name,
        );
      }
    },
  });
}

/**
 * Hook for increasing undername limits
 */
export function useIncreaseUndernames() {
  const queryClient = useQueryClient();

  return useMutation<ContractInteraction, Error, IncreaseUndernamesParams>({
    mutationFn: async (params) => {
      return await dispatchArIOInteraction({
        payload: {
          name: params.name,
          qty: params.qty,
          paymentMethodId: params.paymentMethodId,
          email: params.email,
        },
        workflowName: ARNS_INTERACTION_TYPES.INCREASE_UNDERNAMES,
        owner: params.owner,
        arioContract: params.arioContract,
        processId: params.processId,
        dispatch: params.dispatch,
        signer: params.signer,
        ao: params.ao,
        antAo: params.antAo,
        hyperbeamUrl: params.hyperbeamUrl,
        scheduler: params.scheduler,
        fundFrom: params.fundFrom,
        turboArNSClient: params.turboArNSClient,
      });
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: arnsQueryKeys.record(variables.processId, variables.name),
      });

      // Get the current record
      const currentRecord = queryClient.getQueryData<AoArNSNameData>(
        arnsQueryKeys.record(variables.processId, variables.name),
      );

      if (currentRecord) {
        // Optimistically update the undername limit
        const updatedRecord: AoArNSNameData = {
          ...currentRecord,
          undernameLimit: (currentRecord.undernameLimit || 0) + variables.qty,
        };

        queryClient.setQueryData(
          arnsQueryKeys.record(variables.processId, variables.name),
          updatedRecord,
        );

        // Update collection queries too
        updateCollectionQueries(
          queryClient,
          variables.processId,
          updatedRecord,
          variables.name,
        );
      }

      return { previousRecord: currentRecord };
    },
    onSuccess: async (result, variables) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      invalidateRelatedQueries(
        queryClient,
        variables.processId,
        variables.name,
      );
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousRecord) {
        queryClient.setQueryData(
          arnsQueryKeys.record(variables.processId, variables.name),
          context.previousRecord,
        );
        updateCollectionQueries(
          queryClient,
          variables.processId,
          context.previousRecord,
          variables.name,
        );
      }
    },
  });
}
