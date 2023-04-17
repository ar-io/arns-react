import { useEffect, useState } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';
import { ArNSContractJSON, ArweaveTransactionID } from '../../types';
import eventEmitter from '../../utils/events';

export default function useArNSContract() {
  const [{ arnsContractId, arweaveDataProvider }, dispatch] = useGlobalState();
  const [sendingContractState, setSendingContractState] = useState(false);

  useEffect(() => {
    dispatchNewContractState(arnsContractId);
  }, [arnsContractId, arweaveDataProvider]);

  async function dispatchNewContractState(
    contractId: ArweaveTransactionID,
  ): Promise<void> {
    try {
      if (sendingContractState) {
        return;
      }

      setSendingContractState(true);

      const arnsContractState =
        await arweaveDataProvider.getContractState<ArNSContractJSON>(
          contractId,
        );
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
    } catch (error: any) {
      eventEmitter.emit('error', error);
    }
  }
  return;
}
