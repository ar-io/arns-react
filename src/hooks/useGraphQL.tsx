import { useGlobalState } from '@src/state';
import { queryClient } from '@src/utils/network';
import { queryOptions, useQuery } from '@tanstack/react-query';
import arweaveGraphql, {
  GetTransactionsQuery,
  TransactionEdge,
} from 'arweave-graphql';

type GraphQLQueryParams = Parameters<
  ReturnType<typeof arweaveGraphql>['getTransactions']
>;

export function buildGraphQLQuery(
  graphqlUrl: string,
  ...params: GraphQLQueryParams
) {
  return queryOptions<GetTransactionsQuery | null>({
    queryKey: ['arweave-graphql', JSON.stringify(params), graphqlUrl],
    queryFn: async () => {
      try {
        const gql = arweaveGraphql(graphqlUrl);
        const res = await gql.getTransactions(...params);
        return res;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    staleTime: Infinity,
  });
}
export function useGraphQL(...params: GraphQLQueryParams) {
  const [{ aoNetwork }] = useGlobalState();

  return useQuery<GetTransactionsQuery | null>(
    buildGraphQLQuery(aoNetwork.ANT.GRAPHQL_URL, ...params),
  );
}

export function buildAllGraphQLTransactionsQuery(
  walletAddress: string,
  ids: string[],
  graphqlUrl: string,
) {
  return queryOptions<TransactionEdge['node'][]>({
    queryKey: ['arweave-graphql', walletAddress, graphqlUrl],
    queryFn: async () => {
      if (ids.length === 0) return [];
      const results: TransactionEdge['node'][] = [];
      let cursor = undefined;
      let hasNextPage = true;
      while (hasNextPage) {
        // TODO: get data from query cache directly, filter out ids from batch, then query for ID missing from cache
        const res: GetTransactionsQuery | null =
          await queryClient.fetchQuery<GetTransactionsQuery | null>(
            buildGraphQLQuery(graphqlUrl, {
              ids,
              after: cursor,
              first: 1000,
            }),
          );
        if (!res) {
          hasNextPage = false;
          break;
        }
        res.transactions.edges.forEach((edge: any) => {
          if (!edge) return;
          results.push(edge.node);
          cursor = edge.cursor;
          return;
        });
        hasNextPage = Boolean(res.transactions.pageInfo.hasNextPage);
      }
      return results;
    },
    staleTime: Infinity,
    enabled: ids.length >= 1,
  });
}

export function useAllGraphQLTransactions(
  walletAddress: string,
  ids: string[],
) {
  const [{ aoNetwork }] = useGlobalState();

  return useQuery<TransactionEdge['node'][]>(
    buildAllGraphQLTransactionsQuery(
      walletAddress,
      ids,
      aoNetwork.ANT.GRAPHQL_URL,
    ),
  );
}
