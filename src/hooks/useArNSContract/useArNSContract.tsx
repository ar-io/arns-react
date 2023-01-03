import { useEffect, useState } from 'react';

import { defaultDataProvider } from '../../services/arweave';
import { useGlobalState } from '../../state/contexts/GlobalState';

export default function useArNSContract() {
  const [{ arnsContractId }, dispatch] = useGlobalState();
  const [sendingContractState, setSendingContractState] = useState(false);

  useEffect(() => {
    dispatchNewContractState(arnsContractId);
  }, [arnsContractId]);

  async function dispatchNewContractState(contractId: string): Promise<void> {
    try {
      if (sendingContractState) {
        return;
      }

      setSendingContractState(true);
      const dataProvider = defaultDataProvider();

      const arnsContractState = await dataProvider.getContractState(contractId);
      if (!arnsContractState) {
        throw Error('ArNS contract state is empty');
      }

      if (!arnsContractState.records || !arnsContractState.fees) {
        throw Error(
          `ArNS contract is missing required keys: ${['fees', 'records']
            .filter(
              (required) => !Object.keys(arnsContractState).includes(required),
            )
            .join(', ')}`,
        );
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
