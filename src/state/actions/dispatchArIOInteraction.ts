import {
  AR_IO_CONTRACT_FUNCTIONS,
  ArIOWritable,
  WriteInteractionResult,
} from '@ar.io/sdk/web';
import { ArweaveCompositeDataProvider } from '@src/services/arweave/ArweaveCompositeDataProvider';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { TransactionAction } from '@src/state/reducers/TransactionReducer';
import {
  ARNS_INTERACTION_TYPES,
  ContractInteraction,
  TransactionDataPayload,
} from '@src/types';
import {
  buildSmartweaveInteractionTags,
  pruneExtraDataFromTransactionPayload,
} from '@src/utils';
import {
  ARNS_REGISTRY_ADDRESS,
  ATOMIC_FLAG,
  DEFAULT_ANT_SOURCE_CODE_TX,
  DEFAULT_CONTRACT_CACHE,
  MIN_TTL_SECONDS,
} from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { Dispatch } from 'react';

/**
 *
 * @param arweaveCompositeProvider - Temporary while the ArIO sdk does not support certain interactions
 */
export default async function dispatchArIOInteraction({
  payload,
  workflowName,
  arioContract,
  arweaveCompositeProvider,
  contractTxId,
  dispatch,
}: {
  payload: Record<string, any>;
  workflowName: ARNS_INTERACTION_TYPES;
  arioContract?: ArIOWritable;
  arweaveCompositeProvider: ArweaveCompositeDataProvider;
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
      case ARNS_INTERACTION_TYPES.BUY_RECORD: {
        // TODO: Replace this once the ArIO SDK supports this interaction
        let tags = undefined;
        if (payload.contractTxId === ATOMIC_FLAG) {
          if (payload.targetId && payload.state) {
            payload.state.records['@'] = {
              transactionId: payload.targetId,
              ttlSeconds: MIN_TTL_SECONDS,
            };
          }
        } else if (payload.targetId) {
          tags = buildSmartweaveInteractionTags({
            contractId: new ArweaveTransactionID(payload.contractTxId),
            input: {
              function: 'setRecord',
              subDomain: '@',
              transactionId: payload.targetId,
              ttlSeconds: MIN_TTL_SECONDS,
            },
          });
        }

        const cleanPayload = pruneExtraDataFromTransactionPayload(
          ARNS_INTERACTION_TYPES.BUY_RECORD,
          payload as TransactionDataPayload,
        );
        const writeInteractionId =
          payload.contractTxId === ATOMIC_FLAG
            ? await arweaveCompositeProvider.registerAtomicName({
                walletAddress: payload.walletAddress,
                registryId: ARNS_REGISTRY_ADDRESS,
                srcCodeTransactionId: new ArweaveTransactionID(
                  DEFAULT_ANT_SOURCE_CODE_TX,
                ),
                initialState: payload.state,
                domain: payload.name,
                type: payload.type,
                years: payload.years,
                auction: payload.auction ?? false,
                qty: payload.qty,
                isBid: payload.isBid ?? false,
              })
            : await arweaveCompositeProvider.writeTransaction({
                walletAddress: payload.walletAddress,
                contractTxId: ARNS_REGISTRY_ADDRESS,
                dryWrite: true,
                payload: {
                  function: AR_IO_CONTRACT_FUNCTIONS.BUY_RECORD,
                  ...cleanPayload,
                },
                tags,
                interactionDetails: {
                  isBid: payload.isBid ? payload.isBid : false,
                },
              });

        result = {
          id: writeInteractionId as any as string,
          owner: payload.walletAddress,
        } as any;
        functionName = AR_IO_CONTRACT_FUNCTIONS.BUY_RECORD;

        break;
      }
      case ARNS_INTERACTION_TYPES.EXTEND_LEASE:
        result = await arioContract.extendLease({
          domain: payload.name,
          years: payload.years,
        });
        functionName = AR_IO_CONTRACT_FUNCTIONS.EXTEND_RECORD;
        break;
      case ARNS_INTERACTION_TYPES.INCREASE_UNDERNAMES:
        result = await arioContract.increaseUndernameLimit({
          domain: payload.name,
          qty: payload.qty,
        });
        functionName = AR_IO_CONTRACT_FUNCTIONS.INCREASE_UNDERNAME_COUNT;
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
  if (!functionName) throw new Error('Failed to set workflow name');

  const interaction: ContractInteraction = {
    deployer: payload.walletAddress.toString(),
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
