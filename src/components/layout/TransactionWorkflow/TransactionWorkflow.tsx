import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import {
  ANT_INTERACTION_TYPES,
  AntInteraction,
  ArweaveTransactionID,
  CONTRACT_TYPES,
  ContractType,
  REGISTRY_INTERACTION_TYPES,
  RegistryInteraction,
  TransactionData,
} from '../../../types';
import { AntCard } from '../../cards';
import DeployTransaction from '../DeployTransaction/DeployTransaction';
import TransactionComplete from '../TransactionComplete/TransactionComplete';
import Workflow, { WorkflowStage } from '../Workflow/Workflow';

function TransactionWorkflow({
  contractType,
  interactionType,
  //transactionData,
  workflowStage,
}: {
  contractType: ContractType;
  interactionType: AntInteraction | RegistryInteraction;
  transactionData: Partial<TransactionData>;
  workflowStage: 'pending' | 'confirmed' | 'successful' | 'failed';
}) {
  const [{ deployedTransactionId, transactionData }, dispatchTransactionState] =
    useTransactionState();
  const { assetId, functionName, tags, ...payload } = transactionData;
  const [{ arweaveDataProvider }] = useGlobalState();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [steps, setSteps] = useState<{
    [x: number]: { title: string; status: string };
  }>({});
  const [stages, setStages] = useState<{ [x: string]: WorkflowStage }>({
    pending: {
      component: <AntCard domain={''} compact={false} enableActions={false} />,
    },
    confirmed: {
      component: <DeployTransaction />,
      showNext: false,
      showBack: false,
    },
    successful: {
      component: <TransactionComplete />,
      showNext: false,
      showBack: false,
    },
    failed: {
      component: <TransactionComplete />,
      showNext: false,
      showBack: false,
    },
  });

  useEffect(() => {
    const newSteps = getStepsByTransactionType({
      contractType,
      interactionType,
    });
    const newStages = getStagesByTransactionType({
      contractType,
      interactionType,
    });
    if (newSteps) setSteps(newSteps);
    if (newStages) setStages(newStages);
    if (workflowStage === 'confirmed' && deployedTransactionId) {
      dispatchTransactionState({
        type: 'setWorkflowStage',
        payload: 'successful',
      });
    }
  }, [workflowStage, deployedTransactionId, transactionData]);

  async function handleStage(direction: string) {
    try {
      switch (direction) {
        case 'next':
          switch (workflowStage) {
            case 'pending': {
              dispatchTransactionState({
                type: 'setWorkflowStage',
                payload: 'confirmed',
              });
              const originalTxId = await arweaveDataProvider.writeTransaction(
                new ArweaveTransactionID(assetId!),
                {
                  function: functionName!,
                  payload,
                },
              );
              if (originalTxId) {
                dispatchTransactionState({
                  type: 'setDeployedTransactionId',
                  payload: originalTxId,
                });

                setSearchParams({
                  ...searchParams,
                  deployedTransactionId: originalTxId.toString(),
                });
              }
              return originalTxId;
            }
            case 'confirmed': {
              // deployment section, no next
              return;
            }
            case 'successful': {
              // completed section, no next
              return;
            }
            case 'failed': {
              // completed section, no next
              return;
            }
            default:
              throw new Error(`Invalid workflow stage (${workflowStage})`);
          }
        case 'back':
          switch (workflowStage) {
            case 'pending': {
              navigate(-1);
              return;
            }
            case 'confirmed': {
              return;
            }
            case 'successful': {
              return;
            }
            case 'failed': {
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
      dispatchTransactionState({
        type: 'setError',
        payload: error,
      });
    }
  }
  function getStepsByTransactionType({
    contractType,
    interactionType,
  }: {
    contractType: ContractType;
    interactionType: AntInteraction | RegistryInteraction;
  }): { [x: string]: { title: string; status: string } } {
    try {
      switch (contractType) {
        case CONTRACT_TYPES.REGISTRY:
          switch (interactionType) {
            case REGISTRY_INTERACTION_TYPES.BUY_RECORD: {
              return {
                1: { title: 'Choose a Domain', status: 'success' },
                2: { title: 'Registration Details', status: 'pending' },
                3: { title: 'Confirm Registration', status: '' },
                4: { title: 'Deploy Registration', status: '' },
                5: { title: 'Complete', status: '' },
              };
            }
            case REGISTRY_INTERACTION_TYPES.EXTEND_LEASE: {
              return {
                1: { title: 'Lease Details', status: 'pending' },
                2: { title: 'Confirm Extension', status: '' },
                3: { title: 'Deploy Extension', status: '' },
                4: { title: 'Complete', status: '' },
              };
            }
            case REGISTRY_INTERACTION_TYPES.TRANSFER: {
              return {
                1: { title: 'Set Reciepient', status: 'pending' },
                2: { title: 'Confirm IO Transfer', status: '' },
                3: { title: 'Deploy Transfer', status: '' },
                4: { title: 'Complete', status: '' },
              };
            }
            case REGISTRY_INTERACTION_TYPES.UPGRADE_TIER: {
              return {
                1: { title: 'Choose a Tier', status: 'pending' },
                2: { title: 'Confirm Tier', status: '' },
                3: { title: 'Deploy Tier Upgrade', status: '' },
                4: { title: 'Complete', status: '' },
              };
            }
            default:
              throw new Error(`Invalid interaction type (${interactionType})`);
          }
        case CONTRACT_TYPES.ANT:
          switch (interactionType) {
            case ANT_INTERACTION_TYPES.REMOVE_RECORD: {
              return {
                1: { title: 'Choose Undername', status: 'success' },
                2: { title: 'Confirm Removal', status: 'pending' },
                3: { title: 'Deploy Removal', status: '' },
                4: { title: 'Complete', status: '' },
              };
            }
            case ANT_INTERACTION_TYPES.SET_CONTROLLER: {
              return {
                1: { title: 'Enter a Controller', status: 'success' },
                2: { title: 'Confirm Controller', status: 'pending' },
                3: { title: 'Deploy Controller', status: '' },
                4: { title: 'Complete', status: '' },
              };
            }
            case ANT_INTERACTION_TYPES.SET_NAME: {
              return {
                1: { title: 'Enter a Name', status: 'success' },
                2: { title: 'Confirm ANT Name', status: 'pending' },
                3: { title: 'Deploy Name Change', status: '' },
                4: { title: 'Complete', status: '' },
              };
            }
            case ANT_INTERACTION_TYPES.SET_RECORD: {
              return {
                1: { title: 'Enter Undername Details', status: 'success' },
                2: { title: 'Confirm Undername Details', status: 'pending' },
                3: { title: 'Deploy Undername', status: '' },
                4: { title: 'Complete', status: '' },
              };
            }
            case ANT_INTERACTION_TYPES.SET_TICKER: {
              return {
                1: { title: 'Enter a Ticker', status: 'success' },
                2: { title: 'Confirm Ticker', status: 'pending' },
                3: { title: 'Deploy Ticker Change', status: '' },
                4: { title: 'Complete', status: '' },
              };
            }
            case ANT_INTERACTION_TYPES.TRANSFER: {
              return {
                1: { title: 'Enter Reciepient', status: 'success' },
                2: { title: 'Confirm Transfer', status: 'pending' },
                3: { title: 'Deploy Transfer', status: '' },
                4: { title: 'Complete', status: '' },
              };
            }
            default:
              throw new Error(
                `Invalid workflow stage (${workflowStage}), workflow stage must be a number between 1 and 4`,
              );
          }
        default:
          throw new Error(
            `Invalid TRANSACTIO TYPE {${contractType}}, Only registry or ant types may be provided as a transaction type`,
          );
      }
    } catch (error) {
      console.log(error);
      return {};
    }
  }
  function getStagesByTransactionType({
    contractType,
    interactionType,
  }: {
    contractType: ContractType;
    interactionType: AntInteraction | RegistryInteraction;
  }): { [x: string]: WorkflowStage } | undefined {
    try {
      switch (contractType) {
        case CONTRACT_TYPES.ANT: {
          switch (interactionType) {
            case ANT_INTERACTION_TYPES.CREATE: {
              return {
                pending: {
                  component: (
                    <AntCard
                      domain={''}
                      id={new ArweaveTransactionID(assetId ?? '')}
                      compact={false}
                      enableActions={false}
                    />
                  ),
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
                      state={transactionData.initialState}
                    />
                  ),
                  showNext: false,
                  showBack: false,
                },
                failed: {
                  component: (
                    <TransactionComplete
                      transactionId={deployedTransactionId}
                      state={transactionData.initialState}
                    />
                  ),
                  showNext: false,
                  showBack: false,
                },
              };
            }
            // TODO: implement other ANT interactions
            default:
              throw new Error('Interaction type is undefined');
          }
        }

        case CONTRACT_TYPES.REGISTRY: {
          switch (interactionType) {
            case REGISTRY_INTERACTION_TYPES.BUY_RECORD: {
              return {
                pending: {
                  component: (
                    <AntCard
                      domain={payload.name!}
                      id={new ArweaveTransactionID(payload.contractTxId ?? '')}
                      compact={false}
                      enableActions={false}
                    />
                  ),
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
                      state={transactionData.initialState}
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
