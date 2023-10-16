import { ArweaveCompositeDataProvider } from '../../services/arweave/ArweaveCompositeDataProvider';
import { useGlobalState } from '../../state/contexts/GlobalState';

export function useArweaveCompositeProvider(): ArweaveCompositeDataProvider {
  const [{ arweaveDataProvider }] = useGlobalState();

  return arweaveDataProvider;
}
