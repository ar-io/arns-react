import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useArweaveCompositeProvider } from '../../../hooks';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import {
  ArweaveTransactionID,
  BuyRecordPayload,
  CONTRACT_TYPES,
  ContractType,
  PDNTInteraction,
  PDNT_INTERACTION_TYPES,
  REGISTRY_INTERACTION_TYPES,
  RegistryInteraction,
  TRANSACTION_DATA_KEYS,
  TransactionData,
} from '../../../types';
import {
  getPDNSMappingByInteractionType,
  getTransactionWorkflowSteps,
  isObjectOfTransactionPayloadType,
} from '../../../utils';
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
  contractType,
  interactionType,
  transactionData,
  workflowStage,
}: {
  contractType: ContractType;
  interactionType: PDNTInteraction | RegistryInteraction;
  transactionData: TransactionData;
  workflowStage: TRANSACTION_WORKFLOW_STATUS;
}) {
  const [{ deployedTransactionId }, dispatchTransactionState] =
    useTransactionState();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const { assetId, functionName, ...payload } = transactionData;
  const navigate = useNavigate();
  const [steps, setSteps] = useState<
    | {
        [x: number]: { title: string; status: string };
      }
    | undefined
  >(() => getTransactionWorkflowSteps(interactionType));
  const [stages, setStages] = useState<
    { [x: string]: WorkflowStage } | undefined
  >(() =>
    getStagesByTransactionType({
      contractType,
      interactionType,
    }),
  );

  useEffect(() => {
    const newStages = getStagesByTransactionType({
      contractType,
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

  async function handleStage(direction: string) {
    try {
      switch (direction) {
        case 'next':
          switch (workflowStage) {
            case TRANSACTION_WORKFLOW_STATUS.PENDING: {
              const newSteps = getTransactionWorkflowSteps(interactionType);
              if (!newSteps) {
                throw new Error('Transaction steps is undefined');
              }
              newSteps['1'].status = 'success';
              newSteps['2'].status = 'pending';
              setSteps(newSteps);
              dispatchTransactionState({
                type: 'setWorkflowStage',
                payload: TRANSACTION_WORKFLOW_STATUS.CONFIRMED,
              });
              const originalTxId = await arweaveDataProvider.writeTransaction(
                new ArweaveTransactionID(assetId),
                {
                  function: functionName,
                  ...payload,
                },
              );
              if (originalTxId) {
                dispatchTransactionState({
                  type: 'setDeployedTransactionId',
                  payload: originalTxId,
                });
              }
              newSteps['2'].status = 'success';
              newSteps['3'].status = 'success';
              setSteps(newSteps);

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
    }
  }

  function getStagesByTransactionType({
    contractType,
    interactionType,
  }: {
    contractType: ContractType;
    interactionType: PDNTInteraction | RegistryInteraction;
  }): { [x: string]: WorkflowStage } | undefined {
    try {
      const pdntProps = getPDNSMappingByInteractionType({
        contractType,
        interactionType,
        transactionData,
      });

      if (!pdntProps) {
        throw Error('Unable to get PDNT properties.');
      }
      switch (contractType) {
        case CONTRACT_TYPES.PDNT: {
          switch (interactionType) {
            case PDNT_INTERACTION_TYPES.SET_TTL_SECONDS:
            case PDNT_INTERACTION_TYPES.SET_TARGET_ID:
            case PDNT_INTERACTION_TYPES.SET_TICKER:
            case PDNT_INTERACTION_TYPES.SET_NAME: {
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
                      contractType={contractType}
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
                      contractType={contractType}
                      interactionType={interactionType}
                      transactionData={transactionData}
                    />
                  ),
                  showNext: false,
                  showBack: false,
                },
              };
            }
            default:
              throw new Error('Interaction type is undefined');
          }
        }

        case CONTRACT_TYPES.REGISTRY: {
          switch (interactionType) {
            case REGISTRY_INTERACTION_TYPES.BUY_RECORD: {
              if (
                !isObjectOfTransactionPayloadType<BuyRecordPayload>(
                  payload,
                  TRANSACTION_DATA_KEYS[contractType][interactionType].keys,
                )
              )
                throw Error('Payload is not valid.');
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
                      contractType={contractType}
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
                      contractType={contractType}
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

        default:
          throw new Error('Contract type is undefined');
      }
    } catch (error) {
      console.error(error);
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
