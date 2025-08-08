import { connect } from '@permaweb/aoconnect';
import { ANTProcessData, useGlobalState, useWalletState } from '@src/state';
import { buildAntStateQuery } from '@src/utils/network';
import {
  UseQueryResult,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { TransactionEdge } from 'arweave-graphql';

import { useANTVersions, useLatestANTVersion } from './useANTVersions';
import { useAccessControlList } from './useAccessControlList';
import { buildGraphQLQuery } from './useGraphQL';

export const useAntsForWallet = (): UseQueryResult<
  Record<string, ANTProcessData>
> => {
  const [{ aoNetwork, hyperbeamUrl }] = useGlobalState();
  const queryClient = useQueryClient();
  const [{ walletAddress }] = useWalletState();
  const { data: accessControlList = { Owned: [], Controlled: [] } } =
    useAccessControlList();
  const { data: antVersions = {} } = useANTVersions();
  const { data: latestAntVersion } = useLatestANTVersion();
  return useQuery({
    queryKey: ['ants-with-metadata', walletAddress?.toString()],
    queryFn: async () => {
      const antAo = connect(aoNetwork.ANT);
      const uniqueAnts = [
        ...new Set([
          ...(accessControlList?.Owned ?? []),
          ...(accessControlList?.Controlled ?? []),
        ]),
      ];
      const antsWithMetadata = await Promise.all(
        uniqueAnts.map(async (processId) => {
          const [state, processMeta] = await Promise.all([
            queryClient
              .fetchQuery(
                buildAntStateQuery({
                  processId,
                  ao: antAo,
                  hyperbeamUrl: hyperbeamUrl,
                }),
              )
              .catch((e) => {
                console.error(e);
                return undefined;
              }),
            // TODO: send these in a single request
            queryClient
              .fetchQuery(
                buildGraphQLQuery(aoNetwork.ANT.GRAPHQL_URL, {
                  ids: [processId],
                }),
              )
              .then((res) => res?.transactions.edges[0].node)
              .catch((e) => {
                console.error(e);
                return null;
              }),
          ]);
          const moduleId = processMeta?.tags.find(
            (tag) => tag.name === 'Module',
          )?.value;

          const version = Object.keys(antVersions ?? {}).find(
            (versionNumber) =>
              antVersions?.[versionNumber].moduleId === moduleId,
          );

          const isLatestVersion =
            processMeta?.tags.find((tag) => tag.name === 'Module')?.value ===
            latestAntVersion?.moduleId;

          return {
            [processId]: {
              state,
              version: version ? parseInt(version) : 0,
              processMeta: processMeta as unknown as TransactionEdge['node'],
              isLatestVersion,
              errors: [],
            },
          };
        }),
      );

      return antsWithMetadata.reduce((acc, item) => ({ ...acc, ...item }), {});
    },
  });
};

export const useAntsRequireUpdate = (): {
  ants: string[];
  isLoading: boolean;
} => {
  const { data: antData = {}, isLoading, isRefetching } = useAntsForWallet();
  const {
    data: latestAntVersion,
    isLoading: isLoadingLatestAntVersion,
    isRefetching: isRefetchingLatestAntVersion,
  } = useLatestANTVersion();
  return {
    ants: Object.keys(antData)
      .filter((processId) => {
        return +antData[processId].version < +(latestAntVersion?.version || 0);
      })
      .map((processId) => processId),
    isLoading:
      isLoading ||
      isLoadingLatestAntVersion ||
      isRefetching ||
      isRefetchingLatestAntVersion,
  };
};
