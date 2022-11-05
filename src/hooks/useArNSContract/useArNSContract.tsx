import { LocalFileSystemDataProvider } from '../../services/arweave/LocalFilesystemDataProvider';
import { useStateValue } from '../../state/state';
import { useState, useEffect } from 'react';

const localContractAddress = 'bLAgYxAdX2Ry-nt6aH2ixgvJXbpsEYm28NgJgyqfs-U';

export default function useArNSContract() {
  const [{ arnsSourceContract }, dispatch] = useStateValue();
  const [sendingContractState, setSendingContractState] = useState(false);

  try {
    const localProvider = new LocalFileSystemDataProvider();

    useEffect(() => {
      dispatchNewContractState();
    }, []);
    async function dispatchNewContractState(): Promise<void> {
      if (sendingContractState) {
        return;
      }
      setSendingContractState(true);

      const localState = await localProvider.getContractState(
        localContractAddress,
      );
      if (!localState) {
        throw Error('ArNS contract state is empty');
      }
      console.log(localState);
      dispatch({
        type: 'setArnsContractState',
        payload: { records: localState.records },
      });

      setTimeout(() => {
        // 0.1 second delay before dispatching another calculation to prevent UI jitter
        setSendingContractState(false);
      }, 100);
    }
  } catch (error) {
    console.log(
      `error in setting contract state to GlobalState provider >>>`,
      error,
    );
  }
  return;
}
