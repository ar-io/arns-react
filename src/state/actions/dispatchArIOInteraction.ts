import {
  AoClient,
  AoIOWrite,
  AoMessageResult,
  ContractSigner,
  DEFAULT_SCHEDULER_ID,
  createAoSigner,
  spawnANT,
} from '@ar.io/sdk/web';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { TransactionAction } from '@src/state/reducers/TransactionReducer';
import { ARNS_INTERACTION_TYPES, ContractInteraction } from '@src/types';
import { lowerCaseDomain } from '@src/utils';
import { WRITE_OPTIONS } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { Dispatch } from 'react';

export default async function dispatchArIOInteraction({
  payload,
  workflowName,
  owner,
  arioContract,
  processId,
  dispatch,
  signer,
  ao,
  scheduler = DEFAULT_SCHEDULER_ID,
}: {
  payload: Record<string, any>;
  workflowName: ARNS_INTERACTION_TYPES;
  owner: ArweaveTransactionID;
  arioContract?: AoIOWrite;
  processId: ArweaveTransactionID;
  dispatch: Dispatch<TransactionAction>;
  signer?: ContractSigner;
  ao?: AoClient;
  scheduler?: string;
}): Promise<ContractInteraction> {
  let result: AoMessageResult | undefined = undefined;

  try {
    if (!arioContract) throw new Error('ArIO provider is not defined');
    if (!signer) throw new Error('signer is not defined');
    dispatch({
      type: 'setSigning',
      payload: true,
    });
    switch (workflowName) {
      case ARNS_INTERACTION_TYPES.BUY_RECORD: {
        const { name, type, years } = payload;
        let antProcessId: string = payload.processId;

        if (antProcessId === 'atomic') {
          antProcessId = await spawnANT({
            state: payload.state,
            signer: createAoSigner(signer),
            ao: ao,
            scheduler: scheduler,
          });
        }

        const buyRecordResult = await arioContract.buyRecord({
          name: lowerCaseDomain(name),
          type,
          years,
          processId: antProcessId,
        });

        payload.processId = antProcessId;

        result = buyRecordResult;
        break;
      }
      case ARNS_INTERACTION_TYPES.EXTEND_LEASE:
        result = await arioContract.extendLease(
          {
            name: lowerCaseDomain(payload.name),
            years: payload.years,
          },
          WRITE_OPTIONS,
        );
        break;
      case ARNS_INTERACTION_TYPES.INCREASE_UNDERNAMES:
        result = await arioContract.increaseUndernameLimit(
          {
            name: lowerCaseDomain(payload.name),
            increaseCount: payload.qty,
          },
          WRITE_OPTIONS,
        );
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
    throw new Error('Failed to dispatch ArIO interaction');
  }

  const interaction: ContractInteraction = {
    deployer: owner.toString(),
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
