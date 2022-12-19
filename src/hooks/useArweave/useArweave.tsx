import Arweave from 'arweave';
import { useEffect, useState } from 'react';

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
      });
      dispatch({
        type: 'setArweave',
        payload: arweave,
      });

      // TODO: update existing wallet connector when arweave client changes
      setSendingArweaveState(false);
    } catch (error) {
      console.error(`Error in setting arweave client.`, error);
    }
  }
  return;
}
