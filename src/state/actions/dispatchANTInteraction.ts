import {
  ANTWritable,
  ANT_CONTRACT_FUNCTIONS,
  WriteInteractionResult,
} from '@ar.io/sdk/web';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { TransactionAction } from '@src/state/reducers/TransactionReducer';
import { ANT_INTERACTION_TYPES, ContractInteraction } from '@src/types';
import { DEFAULT_CONTRACT_CACHE } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { Dispatch } from 'react';

export default async function dispatchANTInteraction({
  payload,
  workflowName,
  antProvider,
  contractTxId,
  dispatch,
}: {
  payload: Record<string, any>;
  workflowName: ANT_INTERACTION_TYPES;
  antProvider?: ANTWritable;
  contractTxId: ArweaveTransactionID;
  dispatch: Dispatch<TransactionAction>;
}): Promise<ContractInteraction> {
  let result: WriteInteractionResult | undefined = undefined;
  let functionName;

  try {
    if (!antProvider) throw new Error('ANT provider is not defined');
    dispatch({
      type: 'setSigning',
      payload: true,
    });
    switch (workflowName) {
      case ANT_INTERACTION_TYPES.SET_NAME:
        result = await antProvider.setName({ name: payload.name });
        functionName = ANT_CONTRACT_FUNCTIONS.SET_NAME;
        break;
      case ANT_INTERACTION_TYPES.SET_TARGET_ID:
        result = await antProvider.setRecord({
          subDomain: '@',
          transactionId: payload.transactionId,
          ttlSeconds: payload.ttlSeconds,
        });
        functionName = ANT_CONTRACT_FUNCTIONS.SET_RECORD;
        break;
      case ANT_INTERACTION_TYPES.SET_TTL_SECONDS:
        result = await antProvider.setRecord({
          subDomain: '@',
          transactionId: payload.transactionId,
          ttlSeconds: payload.ttlSeconds,
        });
        functionName = ANT_CONTRACT_FUNCTIONS.SET_RECORD;
        break;
      case ANT_INTERACTION_TYPES.SET_TICKER:
        result = await antProvider.setTicker({ ticker: payload.ticker });
        functionName = ANT_CONTRACT_FUNCTIONS.SET_TICKER;
        break;
      case ANT_INTERACTION_TYPES.SET_CONTROLLER:
        result = await antProvider.setController({
          controller: payload.controller,
        });
        functionName = ANT_CONTRACT_FUNCTIONS.SET_CONTROLLER;
        break;
      case ANT_INTERACTION_TYPES.REMOVE_CONTROLLER:
        result = await antProvider.removeController({
          controller: payload.controller,
        });
        functionName = ANT_CONTRACT_FUNCTIONS.REMOVE_CONTROLLER;
        break;
      case ANT_INTERACTION_TYPES.TRANSFER:
        result = await antProvider.transfer({ target: payload.target });
        functionName = ANT_CONTRACT_FUNCTIONS.TRANSFER;
        break;
      case ANT_INTERACTION_TYPES.SET_RECORD:
        result = await antProvider.setRecord({
          subDomain: payload.subDomain,
          transactionId: payload.transactionId,
          ttlSeconds: payload.ttlSeconds,
        });
        functionName = ANT_CONTRACT_FUNCTIONS.SET_RECORD;
        break;
      case ANT_INTERACTION_TYPES.EDIT_RECORD:
        result = await antProvider.setRecord({
          subDomain: payload.subDomain,
          transactionId: payload.transactionId,
          ttlSeconds: payload.ttlSeconds,
        });
        functionName = ANT_CONTRACT_FUNCTIONS.SET_RECORD;
        break;
      case ANT_INTERACTION_TYPES.REMOVE_RECORD:
        result = await antProvider.removeRecord({
          subDomain: payload.subDomain,
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
