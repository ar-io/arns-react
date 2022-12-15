import { useEffect, useState } from 'react';

import { LocalFileSystemDataProvider } from '../../services/arweave/LocalFilesystemDataProvider';
import { useGlobalState } from '../../state/contexts/GlobalState';

const ARNS_SOURCE_CONTRACT_ID = 'bLAgYxAdX2Ry-nt6aH2ixgvJXbpsEYm28NgJgyqfs-U';

export default function useArNSContract() {
  // eslint-disable-next-line
  const [{}, dispatch] = useGlobalState();
  const [sendingContractState, setSendingContractState] = useState(false);

  useEffect(() => {
    dispatchNewContractState();
  }, []); // eslint-disable-line

  async function dispatchNewContractState(): Promise<void> {
    try {
      if (sendingContractState) {
        return;
      }

      setSendingContractState(true);
      const localProvider = new LocalFileSystemDataProvider();
      const arnsContractState = await localProvider.getContractState(
        ARNS_SOURCE_CONTRACT_ID,
      );
      if (!arnsContractState) {
        throw Error('ArNS contract state is empty');
      }

      dispatch({
        type: 'setArnsContractState',
        payload: arnsContractState,
      });

      setSendingContractState(false);
    } catch (error) {
      console.error(`Error in setting contract state.`, error);
    }
  }
  return;
}
