import { queryOptions, useQuery } from '@tanstack/react-query';
import type { GetTransactionsQuery, TransactionEdge } from 'arweave-graphql';

/**
 * Arweave GraphQL fetcher — no-op stub after the de-AO refactor.
 *
 * Solana ANTs are Metaplex Core NFTs and don't have any Arweave-side
 * GraphQL representation, so the legacy "look up the spawn tx for this ANT
 * processId" pattern doesn't apply. Returning `null` here keeps the
 * consumers compiling and lets them gracefully degrade — every consumer
 * already treats an empty/null result as "no metadata available".
 *
 * Phase 7/8 should remove the consumers entirely.
 */

export function buildGraphQLQuery(_graphqlUrl: string, ..._params: unknown[]) {
  return queryOptions<GetTransactionsQuery | null>({
    queryKey: ['arweave-graphql', 'solana-stub'],
    queryFn: async () => null,
    staleTime: Infinity,
  });
}

export function useGraphQL(..._params: unknown[]) {
  return useQuery<GetTransactionsQuery | null>(buildGraphQLQuery(''));
}

export function buildAllGraphQLTransactionsQuery(
  ids: string[],
  _graphqlUrl: string,
) {
  return queryOptions<TransactionEdge['node'][]>({
    queryKey: ['arweave-graphql', 'all', ids],
    queryFn: async () => [],
    staleTime: Infinity,
    enabled: ids.length >= 1,
  });
}

export function useAllGraphQLTransactions(ids: string[]) {
  return useQuery<TransactionEdge['node'][]>(
    buildAllGraphQLTransactionsQuery(ids, ''),
  );
}
