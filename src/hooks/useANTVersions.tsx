import { ANTVersions, ANT_REGISTRY_ID, AOProcess } from '@ar.io/sdk';
import { connect } from '@permaweb/aoconnect';
import { useGlobalState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

// fetches and returns the latest ANT versions
export function useANTVersions() {
  const [{ aoNetwork }] = useGlobalState();

  return useQuery({
    queryKey: ['ant-versions', aoNetwork],
    queryFn: async () => {
      const versionRegistry = ANTVersions.init({
        process: new AOProcess({
          processId: ANT_REGISTRY_ID,
          ao: connect(aoNetwork.ANT),
        }),
      });
      return versionRegistry.getANTVersions();
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useLatestANTVersion() {
  const [{ aoNetwork }] = useGlobalState();

  return useQuery({
    queryKey: ['ant-latest-versions', aoNetwork],
    queryFn: async () => {
      const versionRegistry = ANTVersions.init({
        process: new AOProcess({
          processId: ANT_REGISTRY_ID,
          ao: connect(aoNetwork.ANT),
        }),
      });
      return versionRegistry.getLatestANTVersion();
    },
    staleTime: 1000 * 60 * 5,
  });
}
