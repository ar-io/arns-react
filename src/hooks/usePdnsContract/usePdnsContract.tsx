import { useEffect, useState } from 'react';

import { useGlobalState } from '../../state/contexts/GlobalState';
import { ArweaveTransactionID, PdnsContractJSON } from '../../types';
import eventEmitter from '../../utils/events';
import { useArweaveCompositeProvider } from '../useArweaveCompositeProvider/useArweaveCompositeProvider';

export function usePdnsContract() {
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [{ pdnsContractId }, dispatch] = useGlobalState();
  const [sendingContractState, setSendingContractState] = useState(false);

  useEffect(() => {
    dispatchNewContractState(pdnsContractId);
  }, [pdnsContractId]);

  async function dispatchNewContractState(
    contractId: ArweaveTransactionID,
  ): Promise<void> {
    try {
      if (sendingContractState) {
        return;
      }

      setSendingContractState(true);

      const pdnsContractState =
        await arweaveDataProvider.getContractState<PdnsContractJSON>(
          contractId,
        );
      if (!pdnsContractState) {
        throw Error('Pdns contract state is empty');
      }

      if (!pdnsContractState.records || !pdnsContractState.fees) {
        throw Error(
          `Pdns contract is missing required keys: ${['fees', 'records']
            .filter(
              (required) => !Object.keys(pdnsContractState).includes(required),
            )
            .join(', ')}`,
        );
      }

      dispatch({
        type: 'setPdnsContractState',
        payload: pdnsContractState,
      });

      setSendingContractState(false);
    } catch (error: any) {
      eventEmitter.emit('error', error);
    }
  }
  return;
}
