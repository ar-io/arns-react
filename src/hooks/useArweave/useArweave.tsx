import Arweave from 'arweave';
import { useEffect, useState } from 'react';

import { ArweaveCompositeDataProvider } from '../../services/arweave/ArweaveCompositeDataProvider';
import { SimpleArweaveDataProvider } from '../../services/arweave/SimpleArweaveDataProvider';
import { WarpDataProvider } from '../../services/arweave/WarpDataProvider';
import { useGlobalState } from '../../state/contexts/GlobalState';

export default function useArweave() {
  const [{ gateway }, dispatch] = useGlobalState();
  const [sendingArweaveState, setSendingArweaveState] = useState(false);

  useEffect(() => {
    dispatchNewArweave(gateway);
  }, [gateway]);

  async function dispatchNewArweave(gateway: string): Promise<void> {
    try {
      if (sendingArweaveState) {
        return;
      }

      setSendingArweaveState(true);

      const arweave = new Arweave({
        host: gateway,
        protocol: 'https',
      });

      const arweaveDataProvider = new ArweaveCompositeDataProvider(
        new WarpDataProvider(arweave),
        new SimpleArweaveDataProvider(arweave),
      );

      dispatch({
        type: 'setArweaveDataProvider',
        payload: arweaveDataProvider,
      });

      setSendingArweaveState(false);
    } catch (error) {
      console.error(`Error in setting arweave client.`, error);
    }
  }
  return;
}
