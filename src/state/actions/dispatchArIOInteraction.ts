import {
  AR_IO_CONTRACT_FUNCTIONS,
  ArIOWritable,
  WriteInteractionResult,
} from '@ar.io/sdk/web';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { TransactionAction } from '@src/state/reducers/TransactionReducer';
import { ARNS_INTERACTION_TYPES, ContractInteraction } from '@src/types';
import { DEFAULT_CONTRACT_CACHE } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { Dispatch } from 'react';

export default async function dispatchArIOInteraction({
  payload,
  workflowName,
  arioContract,
  contractTxId,
  dispatch,
}: {
  payload: Record<string, any>;
  workflowName: ARNS_INTERACTION_TYPES;
  arioContract?: ArIOWritable;
  contractTxId: ArweaveTransactionID;
  dispatch: Dispatch<TransactionAction>;
}): Promise<ContractInteraction> {
  let result: WriteInteractionResult | undefined = undefined;
  let functionName;

  try {
    if (!arioContract) throw new Error('ArIO provider is not defined');
    dispatch({
      type: 'setSigning',
      payload: true,
    });
    switch (workflowName) {
      // TODO: add the cases for extend lease and increase undernames from sdk
      case ARNS_INTERACTION_TYPES.EXTEND_LEASE:
        result = await arioContract.transfer({
          target: payload.target,
          qty: payload.qty,
        });
        functionName = AR_IO_CONTRACT_FUNCTIONS.TRANSFER;
        break;
      case ARNS_INTERACTION_TYPES.INCREASE_UNDERNAMES:
        result = await arioContract.transfer({
          target: payload.target,
          qty: payload.qty,
        });
        functionName = AR_IO_CONTRACT_FUNCTIONS.TRANSFER;
        break;
      default:
        throw new Error(`Unsupported workflow name: ${workflowName}`);
    }
  } catch (error) {
    eventEmitter.emit('error', error);
  } finally {
    dispatch({
      type: 'setSigning',
      payload: false,
    });
  }
  if (!result) {
    throw new Error('Failed to dispatch ANT interaction');
  }
  if (!functionName) throw new Error('Failed to set workflow name');

  const interaction: ContractInteraction = {
    deployer: result.owner,
    contractTxId: contractTxId.toString(),
    id: await result.id,
    payload: {
      ...payload,
      function: functionName,
    },
    type: 'interaction',
  };

  await DEFAULT_CONTRACT_CACHE.push(contractTxId.toString(), interaction);

  dispatch({
    type: 'setWorkflowName',
    payload: workflowName,
  });
  dispatch({
    type: 'setInteractionResult',
    payload: interaction,
  });
  return interaction;
}
