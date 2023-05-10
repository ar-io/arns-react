import { useEffect } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState.js';
import { useArweaveCompositeProvider } from '../useArweaveCompositeProvider/useArweaveCompositeProvider.js';

const BLOCK_HEIGHT_INTERVAL_SECS = 60;
export function useBlockHeight() {
  const arweaveCompositeDataProvider = useArweaveCompositeProvider();
  const [, dispatchGlobalState] = useGlobalState();
  useEffect(() => {
    const interval = setInterval(async () => {
      const height = await arweaveCompositeDataProvider.getCurrentBlockHeight();
      dispatchGlobalState({
        type: 'setHeight',
        payload: height,
      });
    }, BLOCK_HEIGHT_INTERVAL_SECS * 1000);

    return () => clearInterval(interval);
  }, []);
}
