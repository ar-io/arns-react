import { ANTRegistry, ANT_REGISTRY_ID, AOProcess } from '@ar.io/sdk';
import { connect } from '@permaweb/aoconnect';
import { useGlobalState } from '@src/state';
import { useQuery } from '@tanstack/react-query';

// fetches and returns the latest ANT versions
export function useANTVersions() {
  const [{ aoNetwork }] = useGlobalState();

  return useQuery({
    queryKey: ['ant-registry-versions', aoNetwork],
    queryFn: async () => {
      const antRegistry = ANTRegistry.init({
        process: new AOProcess({
          processId: ANT_REGISTRY_ID,
          ao: connect(aoNetwork.ANT),
        }),
      });
      const versions = await antRegistry.getVersions().then((res) => {
        return Object.fromEntries(
          Object.entries(res).sort(([a], [b]) => a.localeCompare(b)),
        );
      });
      return versions;
    },
    staleTime: 1000 * 60 * 5,
  });
}
