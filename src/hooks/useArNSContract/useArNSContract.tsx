import { LocalFileSystemDataProvider } from '../../services/arweave/LocalFilesystemDataProvider';
import { useStateValue } from '../../state/state';
import { useState, useEffect } from 'react';

const ARNS_SOURCE_CONTRACT_ID = 'bLAgYxAdX2Ry-nt6aH2ixgvJXbpsEYm28NgJgyqfs-U';

export default function useArNSContract() {
  const [{ arnsSourceContract }, dispatch] = useStateValue();
  const [sendingContractState, setSendingContractState] = useState(false);

  useEffect(() => {
    dispatchNewContractState();
  }, []);
  
  async function dispatchNewContractState(): Promise<void> {
    try {
      const localProvider = new LocalFileSystemDataProvider();
      if (sendingContractState) {
        return;
      }
      setSendingContractState(true);

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

      setTimeout(() => {
        // 0.1 second delay before dispatching another calculation to prevent UI jitter
        setSendingContractState(false);
      }, 100);
    } catch (error) {
      console.log(
        `Error in setting contract state.`,
        error,
      );
    }
  }
  return;
}
