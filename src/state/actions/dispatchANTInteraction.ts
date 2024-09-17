import { ANT, AoMessageResult, ContractSigner } from '@ar.io/sdk/web';
import { TransactionAction } from '@src/state/reducers/TransactionReducer';
import { ANT_INTERACTION_TYPES, ContractInteraction } from '@src/types';
import eventEmitter from '@src/utils/events';
import { Dispatch } from 'react';

export default async function dispatchANTInteraction({
  payload,
  workflowName,
  processId,
  signer,
  owner,
  dispatch,
}: {
  payload: Record<string, any>;
  workflowName: ANT_INTERACTION_TYPES;
  signer: ContractSigner;
  owner: string;
  processId: string;
  dispatch: Dispatch<TransactionAction>;
}): Promise<ContractInteraction> {
  let result: AoMessageResult | undefined = undefined;

  const antProcess = ANT.init({
    processId: processId,
    signer,
  });

  try {
    if (!antProcess) throw new Error('ANT provider is not defined');
    switch (workflowName) {
      case ANT_INTERACTION_TYPES.SET_NAME:
        dispatch({
          type: 'setSigningMessage',
          payload: 'Setting name, please wait...',
        });
        result = await antProcess.setName({ name: payload.name });
        break;
      case ANT_INTERACTION_TYPES.SET_TARGET_ID:
        dispatch({
          type: 'setSigningMessage',
          payload: 'Setting Target ID, please wait...',
        });
        result = await antProcess.setRecord({
          undername: '@',
          transactionId: payload.transactionId,
          ttlSeconds: payload.ttlSeconds,
        });
        break;
      case ANT_INTERACTION_TYPES.SET_TTL_SECONDS:
        dispatch({
          type: 'setSigningMessage',
          payload: 'Setting TTL Seconds, please wait...',
        });
        result = await antProcess.setRecord({
          undername: '@',
          transactionId: payload.transactionId,
          ttlSeconds: payload.ttlSeconds,
        });
        break;
      case ANT_INTERACTION_TYPES.SET_TICKER:
        dispatch({
          type: 'setSigningMessage',
          payload: 'Setting Ticker, please wait...',
        });
        result = await antProcess.setTicker({ ticker: payload.ticker });
        break;
      case ANT_INTERACTION_TYPES.SET_CONTROLLER:
        dispatch({
          type: 'setSigningMessage',
          payload: 'Setting Controller, please wait...',
        });
        result = await antProcess.addController({
          controller: payload.controller,
        });
        break;
      case ANT_INTERACTION_TYPES.REMOVE_CONTROLLER:
        dispatch({
          type: 'setSigningMessage',
          payload: 'Removing Controller, please wait...',
        });
        result = await antProcess.removeController({
          controller: payload.controller,
        });
        break;
      case ANT_INTERACTION_TYPES.TRANSFER:
        dispatch({
          type: 'setSigningMessage',
          payload: 'Transferring ANT, please wait...',
        });
        result = await antProcess.transfer({ target: payload.target });
        break;
      case ANT_INTERACTION_TYPES.SET_RECORD:
        dispatch({
          type: 'setSigningMessage',
          payload: 'Creating Undername, please wait...',
        });
        result = await antProcess.setRecord({
          undername: payload.subDomain,
          transactionId: payload.transactionId,
          ttlSeconds: payload.ttlSeconds,
        });
        break;
      case ANT_INTERACTION_TYPES.EDIT_RECORD:
        dispatch({
          type: 'setSigningMessage',
          payload: 'Editing Undername, please wait...',
        });
        result = await antProcess.setRecord({
          undername: payload.subDomain,
          transactionId: payload.transactionId,
          ttlSeconds: payload.ttlSeconds,
        });
        break;
      case ANT_INTERACTION_TYPES.REMOVE_RECORD:
        dispatch({
          type: 'setSigningMessage',
          payload: 'Deleting Undername, please wait...',
        });
        result = await antProcess.removeRecord({
          undername: payload.subDomain,
        });
        break;
      default:
        throw new Error(`Unsupported workflow name: ${workflowName}`);
    }
  } catch (error) {
    eventEmitter.emit('error', error);
  } finally {
    dispatch({
      type: 'setSigningMessage',
      payload: undefined,
    });
  }
  if (!result) {
    throw new Error('Failed to dispatch ANT interaction');
  }

  const interaction: ContractInteraction = {
    deployer: owner,
    processId: processId.toString(),
    id: result.id,
    type: 'interaction',
    payload,
  };

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
