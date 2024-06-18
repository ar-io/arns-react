import {
  ANT,
  ANT_CONTRACT_FUNCTIONS,
  AoMessageResult,
  ArconnectSigner,
} from '@ar.io/sdk';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
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
  signer: ArconnectSigner;
  owner: string;
  processId: ArweaveTransactionID;
  dispatch: Dispatch<TransactionAction>;
}): Promise<ContractInteraction> {
  let result: AoMessageResult | undefined = undefined;
  let functionName;

  const antProcess = ANT.init({
    processId: processId.toString(),
    signer,
  });

  try {
    if (!antProcess) throw new Error('ANT provider is not defined');
    dispatch({
      type: 'setSigning',
      payload: true,
    });
    switch (workflowName) {
      case ANT_INTERACTION_TYPES.SET_NAME:
        result = await antProcess.setName({ name: payload.name });
        functionName = ANT_CONTRACT_FUNCTIONS.SET_NAME;
        break;
      case ANT_INTERACTION_TYPES.SET_TARGET_ID:
        result = await antProcess.setRecord({
          undername: '@',
          transactionId: payload.transactionId,
          ttlSeconds: payload.ttlSeconds,
        });
        functionName = ANT_CONTRACT_FUNCTIONS.SET_RECORD;
        break;
      case ANT_INTERACTION_TYPES.SET_TTL_SECONDS:
        result = await antProcess.setRecord({
          undername: '@',
          transactionId: payload.transactionId,
          ttlSeconds: payload.ttlSeconds,
        });
        functionName = ANT_CONTRACT_FUNCTIONS.SET_RECORD;
        break;
      case ANT_INTERACTION_TYPES.SET_TICKER:
        result = await antProcess.setTicker({ ticker: payload.ticker });
        functionName = ANT_CONTRACT_FUNCTIONS.SET_TICKER;
        break;
      case ANT_INTERACTION_TYPES.SET_CONTROLLER:
        result = await antProcess.addController({
          controller: payload.controller,
        });
        functionName = ANT_CONTRACT_FUNCTIONS.SET_CONTROLLER;
        break;
      case ANT_INTERACTION_TYPES.REMOVE_CONTROLLER:
        result = await antProcess.removeController({
          controller: payload.controller,
        });
        functionName = ANT_CONTRACT_FUNCTIONS.REMOVE_CONTROLLER;
        break;
      case ANT_INTERACTION_TYPES.TRANSFER:
        result = await antProcess.transfer({ target: payload.target });
        functionName = ANT_CONTRACT_FUNCTIONS.TRANSFER;
        break;
      case ANT_INTERACTION_TYPES.SET_RECORD:
        result = await antProcess.setRecord({
          undername: payload.subDomain,
          transactionId: payload.transactionId,
          ttlSeconds: payload.ttlSeconds,
        });
        functionName = ANT_CONTRACT_FUNCTIONS.SET_RECORD;
        break;
      case ANT_INTERACTION_TYPES.EDIT_RECORD:
        result = await antProcess.setRecord({
          undername: payload.subDomain,
          transactionId: payload.transactionId,
          ttlSeconds: payload.ttlSeconds,
        });
        functionName = ANT_CONTRACT_FUNCTIONS.SET_RECORD;
        break;
      case ANT_INTERACTION_TYPES.REMOVE_RECORD:
        result = await antProcess.removeRecord({
          undername: payload.subDomain,
        });
        functionName = ANT_CONTRACT_FUNCTIONS.REMOVE_RECORD;
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
    deployer: owner,
    processId: processId.toString(),
    id: result.id,
    payload: {
      ...payload,
      function: functionName,
    },
    type: 'interaction',
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
