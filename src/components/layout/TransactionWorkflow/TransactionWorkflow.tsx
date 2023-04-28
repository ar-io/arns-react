import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useArweaveCompositeProvider } from '../../../hooks';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import {
  ArweaveTransactionID,
  BuyRecordPayload,
  CreatePDNTPayload,
  ExcludedValidInteractionType,
  INTERACTION_TYPES,
  TransactionData,
  ValidInteractionType,
} from '../../../types';
import {
  TRANSACTION_DATA_KEYS,
  getPDNSMappingByInteractionType,
  getWorkflowStepsForInteraction,
  isObjectOfTransactionPayloadType,
} from '../../../utils';
import eventEmitter from '../../../utils/events';
import { PDNTCard } from '../../cards';
import DeployTransaction from '../DeployTransaction/DeployTransaction';
import TransactionComplete from '../TransactionComplete/TransactionComplete';
import Workflow, { WorkflowStage } from '../Workflow/Workflow';

export enum TRANSACTION_WORKFLOW_STATUS {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
}

function TransactionWorkflow({
  interactionType,
  transactionData,
  workflowStage,
}: {
  interactionType: ExcludedValidInteractionType;
  transactionData: TransactionData;
  workflowStage: TRANSACTION_WORKFLOW_STATUS;
}) {
  const [{ deployedTransactionId }, dispatchTransactionState] =
    useTransactionState();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const { assetId, functionName, ...payload } = transactionData;
  const navigate = useNavigate();
  const [steps] = useState(() =>
    getWorkflowStepsForInteraction(interactionType),
  );
  const [stages, setStages] = useState<
    { [x: string]: WorkflowStage } | undefined
  >(() =>
    getStagesByTransactionType({
      interactionType,
    }),
  );

  useEffect(() => {
    const newStages = getStagesByTransactionType({
      interactionType,
    });
    if (newStages) setStages(newStages);
    if (
      workflowStage === TRANSACTION_WORKFLOW_STATUS.CONFIRMED &&
      deployedTransactionId
    ) {
      dispatchTransactionState({
        type: 'setWorkflowStage',
        payload: TRANSACTION_WORKFLOW_STATUS.SUCCESSFUL,
      });
    }
  }, [workflowStage, deployedTransactionId, transactionData]);

  async function deployTransaction() {
    try {
      const originalTxId =
        interactionType === INTERACTION_TYPES.CREATE &&
        isObjectOfTransactionPayloadType<CreatePDNTPayload>(
          payload,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.CREATE].keys,
        )
          ? await arweaveDataProvider.deployContract({
              srcCodeTransactionId: new ArweaveTransactionID(
                payload.srcCodeTransactionId,
              ),
              initialState: payload.initialState,
              tags: payload?.tags,
            })
          : await arweaveDataProvider.writeTransaction(
              new ArweaveTransactionID(assetId),
              {
                function: functionName,
                ...payload,
              },
            );
      if (originalTxId) {
        dispatchTransactionState({
          type: 'setDeployedTransactionId',
          payload: new ArweaveTransactionID(originalTxId.toString()),
        });
      }
      return originalTxId;
    } catch (error: any) {
      console.error(error);
      throw new Error(error);
    }
  }

  async function handleStage(direction: string) {
    try {
      switch (direction) {
        case 'next':
          switch (workflowStage) {
            case TRANSACTION_WORKFLOW_STATUS.PENDING: {
              steps['1'].status = 'success';
              steps['2'].status = 'pending';
              dispatchTransactionState({
                type: 'setWorkflowStage',
                payload: TRANSACTION_WORKFLOW_STATUS.CONFIRMED,
              });
              const originalTxId = deployTransaction();
              steps['2'].status = 'success';
              steps['3'].status = 'success';

              return originalTxId;
            }

            default:
              throw new Error(`Invalid workflow stage (${workflowStage})`);
          }
        case 'back':
          switch (workflowStage) {
            case TRANSACTION_WORKFLOW_STATUS.PENDING: {
              navigate(-1);
              return;
            }
            default:
              throw new Error(`Invalid workflow stage (${workflowStage})`);
          }
        default:
          throw new Error(
            `Invalid direction {${direction}}, Only next or back may be provided as directions`,
          );
      }
    } catch (error) {
      console.error(error);
      eventEmitter.emit('error', error);
      dispatchTransactionState({
        type: 'setWorkflowStage',
        payload: TRANSACTION_WORKFLOW_STATUS.PENDING,
      });
    }
  }
  function getStagesByTransactionType({
    interactionType,
  }: {
    interactionType: ValidInteractionType;
  }): { [x: string]: WorkflowStage } | undefined {
    const pdntProps = getPDNSMappingByInteractionType({
      interactionType,
      transactionData,
    });

    if (!pdntProps) {
      throw Error('Unable to get PDNT properties.');
    }
    switch (interactionType) {
      case INTERACTION_TYPES.SET_CONTROLLER:
      case INTERACTION_TYPES.TRANSFER:
      case INTERACTION_TYPES.CREATE:
      case INTERACTION_TYPES.SET_TTL_SECONDS:
      case INTERACTION_TYPES.SET_TARGET_ID:
      case INTERACTION_TYPES.SET_TICKER:
      case INTERACTION_TYPES.SET_NAME: {
        return {
          pending: {
            component: <PDNTCard {...pdntProps} />,
          },
          confirmed: {
            component: <DeployTransaction />,
            showNext: false,
            showBack: false,
          },
          successful: {
            component: (
              <TransactionComplete
                transactionId={deployedTransactionId}
                interactionType={interactionType}
                transactionData={transactionData}
              />
            ),
            showNext: false,
            showBack: false,
          },
          failed: {
            component: (
              <TransactionComplete
                transactionId={deployedTransactionId}
                interactionType={interactionType}
                transactionData={transactionData}
              />
            ),
            showNext: false,
            showBack: false,
          },
        };
      }
      case INTERACTION_TYPES.BUY_RECORD: {
        return {
          pending: {
            component: <PDNTCard {...pdntProps} />,
            header: (
              <>
                <div className="flex flex-row text-large white bold center">
                  Confirm Name Purchase
                </div>
              </>
            ),
          },
          confirmed: {
            component: <DeployTransaction />,
            showNext: false,
            showBack: false,
            header: (
              <>
                <div className="flex flex-row text-large white bold center">
                  Deploy Name Purchase
                </div>
              </>
            ),
          },
          successful: {
            component: (
              <TransactionComplete
                transactionId={deployedTransactionId}
                interactionType={interactionType}
                transactionData={transactionData}
              />
            ),
            showNext: false,
            showBack: false,
            header: (
              <>
                <div className="flex flex-row text-large white bold center">
                  <span className="text-large white center">
                    <b>{payload.name}</b>.arweave.net is yours!
                  </span>
                </div>
              </>
            ),
          },
          failed: {
            component: (
              <TransactionComplete
                transactionId={deployedTransactionId}
                interactionType={interactionType}
                transactionData={transactionData}
              />
            ),
            showNext: false,
            showBack: false,
          },
        };
      }
      // TODO implement other registry interactions
      default:
        throw new Error('Interaction type is undefined');
    }
  }

  return (
    <>
      <Workflow
        onNext={() => handleStage('next')}
        onBack={() => handleStage('back')}
        stage={workflowStage}
        steps={steps}
        stages={stages}
      />
    </>
  );
}

export default TransactionWorkflow;
