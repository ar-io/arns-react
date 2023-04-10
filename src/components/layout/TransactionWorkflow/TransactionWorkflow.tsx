import React, { useEffect, useState } from 'react';

import { useIsMobile, useWalletAddress } from '../../../hooks';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import {
  ANT_INTERACTION_TYPES,
  AntInteraction,
  CONTRACT_TYPES,
  ContractType,
  REGISTRY_INTERACTION_TYPES,
  RegistryInteraction,
  TRANSACTION_DATA_KEYS,
} from '../../../types';
import Workflow from '../Workflow/Workflow';

function TransactionWorkflow({
  children,
  contractType,
  interactionType,
}: {
  children: React.ReactNode; // stage one
  contractType: ContractType;
  interactionType: AntInteraction | RegistryInteraction;
  onSubmit: () => void; // transaction executor?
}) {
  const isMobile = useIsMobile();
  const [{ transactionData, workflowStage }, dispatch] = useTransactionState();
  const { walletAddress } = useWalletAddress();

  const [steps, setSteps] = useState({});
  const [stages, setStages] = useState({});

  useEffect(() => {}, [contractType]);

  async function handleStage(direction: string) {
    try {
      switch (direction) {
        case 'next':
          switch (workflowStage) {
            case 1: {
              try {
                if (!transactionData) {
                  throw new Error(`Transaction data is undefined`);
                }
                if (!contractType) {
                  throw new Error(`Transaction type is undifined.`);
                }

                if (
                  //Object.keys(transactionData) !==
                  // TRANSACTION_DATA_KEYS[contractType][interactionType]
                  true
                ) {
                  throw new Error(
                    `Structure of transaction data not compatible with the set transaction type. Data: ${transactionData}, transaction type: ${contractType}`,
                  );
                }
              } catch (error) {
                console.error(error);
              }
              return;
            }
            case 2: {
              return;
            }
            case 3: {
              return;
            }
            case 4: {
              return;
            }
            default:
              throw new Error(
                `Invalid workflow stage (${workflowStage}), workflow stage must be a number between 1 and 4`,
              );
          }
        case 'back':
          switch (workflowStage) {
            case 1: {
              return;
            }
            case 2: {
              return;
            }
            case 3: {
              return;
            }
            case 4: {
              return;
            }
            default:
              throw new Error(
                `Invalid workflow stage (${workflowStage}), workflow stage must be a number between 1 and 4`,
              );
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
  function getStepsByTransactionType({
    contractType,
    interactionType,
  }: {
    contractType: CONTRACT_TYPES;
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
  }) {
    try {
      switch (contractType) {
        case CONTRACT_TYPES.ANT: {
          switch (interactionType) {
            case ANT_INTERACTION_TYPES.BALANCE: {
            }

            default:
              throw new Error('Interaction type is undefined');
          }
        }

        case CONTRACT_TYPES.REGISTRY: {
          switch (interactionType) {
            case REGISTRY_INTERACTION_TYPES.TRANSFER: {
              // return {
              //         header?: JSX.Element | undefined;
              //         component: JSX.Element;
              //         showNext?: boolean | undefined;
              //         showBack?: boolean | undefined;
              //         disableNext?: boolean | undefined;
              //         requiresWallet?: boolean | undefined;
              //         customNextStyle?: any;
              //         customBackStyle?: any;
              //         backText?: string | undefined;
              //         nextText?: string | undefined;
              // }
            }

            default:
              throw new Error('Interaction type is undefined');
          }
        }

        default:
          throw new Error('Contract type is undefined');
      }
    } catch (error) {}
  }

  return (
    <>
      <Workflow
        onNext={() => handleStage('next')}
        onBack={() => handleStage('back')}
        stage={workflowStage}
        stages={stages}
      />
      {children}
    </>
  );
}

export default TransactionWorkflow;
