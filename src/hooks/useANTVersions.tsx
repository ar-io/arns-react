import { ANTVersions, AOProcess } from '@ar.io/sdk';
import { connect } from '@permaweb/aoconnect';
import { useGlobalState } from '@src/state';
import { NETWORK_DEFAULTS } from '@src/utils/constants';
import { queryOptions, useQuery } from '@tanstack/react-query';

export function buildANTVersionsQuery({
  aoNetwork,
  antRegistryProcessId,
}: {
  aoNetwork: typeof NETWORK_DEFAULTS.AO;
  antRegistryProcessId: string;
}) {
  return queryOptions({
    queryKey: ['ant-versions', aoNetwork, antRegistryProcessId],
    queryFn: async () => {
      const versionRegistry = ANTVersions.init({
        process: new AOProcess({
          processId: antRegistryProcessId,
          ao: connect(aoNetwork.ANT),
        }),
      });
      return versionRegistry.getANTVersions();
    },
    staleTime: Infinity, // these rarely change
  });
}

// fetches and returns the latest ANT versions
export function useANTVersions() {
  const [{ aoNetwork, antRegistryProcessId }] = useGlobalState();

  return useQuery(buildANTVersionsQuery({ aoNetwork, antRegistryProcessId }));
}
export function useLatestANTVersion() {
  const [{ aoNetwork, antRegistryProcessId }] = useGlobalState();

  return useQuery({
    queryKey: ['ant-latest-versions', aoNetwork, antRegistryProcessId],
    queryFn: async () => {
      const versionRegistry = ANTVersions.init({
        process: new AOProcess({
          processId: antRegistryProcessId,
          ao: connect(aoNetwork.ANT),
        }),
      });
      return versionRegistry.getLatestANTVersion();
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
