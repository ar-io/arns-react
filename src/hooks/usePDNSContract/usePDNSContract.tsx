import { useEffect, useState } from 'react';

import { ArweaveTransactionID } from '../../services/arweave/ArweaveTransactionID';
import { useGlobalState } from '../../state/contexts/GlobalState';
import { PDNSContractJSON } from '../../types';
import eventEmitter from '../../utils/events';

export function usePDNSContract() {
  const [{ pdnsContractId, blockHeight, arweaveDataProvider }, dispatch] =
    useGlobalState();
  const [sendingContractState, setSendingContractState] = useState(false);

  useEffect(() => {
    dispatchNewContractState(pdnsContractId);
  }, [pdnsContractId, blockHeight]);

  async function dispatchNewContractState(
    contractId: ArweaveTransactionID,
  ): Promise<void> {
    try {
      if (sendingContractState) {
        return;
      }

      setSendingContractState(true);

      const pdnsContractState =
        await arweaveDataProvider.getContractState<PDNSContractJSON>(
          contractId,
        );
      if (!pdnsContractState) {
        throw Error('ARNS contract state is empty');
      }

      if (!pdnsContractState.records || !pdnsContractState.fees) {
        throw Error(
          `ARNS contract is missing required keys: ${['fees', 'records']
            .filter(
              (required) => !Object.keys(pdnsContractState).includes(required),
            )
            .join(', ')}`,
        );
      }

      dispatch({
        type: 'setPDNSContractState',
        payload: pdnsContractState,
      });

      setSendingContractState(false);
    } catch (error: any) {
      eventEmitter.emit('error', error);
    }
  }
  return;
}
