import {
  AoARIOWrite,
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

import { arnsQueryKeys, invalidateRelatedQueries } from './index';

/**
 * Enhanced wrapper around dispatchArIOInteraction that adds smart cache management
 * This integrates with the existing dispatch pattern while providing modern mutation hooks
 */

interface EnhancedArIOInteractionParams {
  payload: Record<string, any>;
  workflowName: ARNS_INTERACTION_TYPES;
  owner: AoAddress;
  arioContract: AoARIOWrite;
  processId: string;
  dispatch: Dispatch<TransactionAction>;
  signer: ContractSigner;
  ao?: AoClient;
  antAo?: AoClient;
  hyperbeamUrl?: string;
  scheduler?: string;
  fundFrom?: FundFrom | 'fiat';
  turboArNSClient?: TurboArNSClient;
}

/**
 * Enhanced version of dispatchArIOInteraction with React Query integration
 * Provides automatic cache management and optimistic updates
 */
export function useEnhancedArIOInteraction() {
  const queryClient = useQueryClient();

  return useMutation<ContractInteraction, Error, EnhancedArIOInteractionParams>(
    {
      mutationFn: async (params) => {
        return await dispatchArIOInteraction(params);
      },
      onSuccess: async (result, variables) => {
        // Enhanced cache management based on interaction type
        const { workflowName, payload, processId, owner } = variables;

        // Add a delay to allow for transaction processing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        switch (workflowName) {
          case ARNS_INTERACTION_TYPES.BUY_RECORD: {
            // For buy record, invalidate user records and the specific record
            invalidateRelatedQueries(queryClient, processId, payload.name);

            // Invalidate user's records specifically
            queryClient.invalidateQueries({
              queryKey: arnsQueryKeys.recordsForAddress(
                processId,
                owner.toString(),
              ),
            });
            break;
          }

          case ARNS_INTERACTION_TYPES.EXTEND_LEASE:
          case ARNS_INTERACTION_TYPES.UPGRADE_NAME:
          case ARNS_INTERACTION_TYPES.INCREASE_UNDERNAMES: {
            // For modifications to existing records, invalidate the specific record and collections
            invalidateRelatedQueries(queryClient, processId, payload.name);
            break;
          }

          case ARNS_INTERACTION_TYPES.PRIMARY_NAME_REQUEST: {
            // For primary name requests, invalidate user data
            queryClient.invalidateQueries({
              queryKey: arnsQueryKeys.recordsForAddress(
                processId,
                owner.toString(),
              ),
            });

            // Also invalidate the specific record if available
            if (payload.name) {
              invalidateRelatedQueries(queryClient, processId, payload.name);
            }
            break;
          }

          default:
            // For any other interactions, do a broad invalidation
            queryClient.invalidateQueries({
              queryKey: arnsQueryKeys.records(),
              predicate: (query) => query.queryKey.includes(processId),
            });
        }

        // Also invalidate balance-related queries (preserving existing behavior)
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) =>
            queryKey.includes('io-balance') ||
            queryKey.includes('ario-liquid-balance') ||
            queryKey.includes('ario-delegated-stake') ||
            queryKey.includes('turbo-credit-balance') ||
            (payload.name && queryKey.includes(lowerCaseDomain(payload.name))),
        });
      },
      onError: (error, variables) => {
        // Log error but don't do any cache manipulation
        console.error(
          `ArIO interaction failed for ${variables.workflowName}:`,
          error,
        );
      },
    },
  );
}
