import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useArweaveCompositeProvider } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import {
  ArweaveTransactionID,
  BuyRecordPayload,
  CreatePDNTPayload,
  ExcludedValidInteractionType,
  INTERACTION_TYPES,
  PDNTInteractionType,
  RegistryInteractionType,
  TransactionData,
  ValidInteractionType,
  pdntInteractionTypes,
  registryInteractionTypes,
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
  const [{ gateway, walletAddress }] = useGlobalState();
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

  async function deployTransaction(): Promise<string> {
    let originalTxId: string | undefined = undefined;
    if (!walletAddress) {
      throw Error('No wallet connected.');
    }
    if (
      interactionType === INTERACTION_TYPES.CREATE &&
      isObjectOfTransactionPayloadType<CreatePDNTPayload>(
        payload,
        TRANSACTION_DATA_KEYS[INTERACTION_TYPES.CREATE].keys,
      )
    ) {
      originalTxId = await arweaveDataProvider.deployContract({
        walletAddress,
        srcCodeTransactionId: new ArweaveTransactionID(
          payload.srcCodeTransactionId,
        ),
        initialState: payload.initialState,
        tags: payload?.tags,
      });
    } else {
      const writeInteractionId = await arweaveDataProvider.writeTransaction({
        walletAddress,
        contractTxId: new ArweaveTransactionID(assetId),
        payload: {
          function: functionName,
          ...payload,
        },
      });
      originalTxId = writeInteractionId?.toString();
    }
    if (!originalTxId) {
      throw Error('Unable to create transaction');
    }
    return originalTxId;
  }

  function resetToPending() {
    steps['1'].status = 'pending';
    steps['2'].status = '';
    steps['3'].status = '';
    dispatchTransactionState({
      type: 'setWorkflowStage',
      payload: TRANSACTION_WORKFLOW_STATUS.PENDING,
    });
  }

  async function handleStage(direction: string) {
    try {
      if (direction === 'next' && TRANSACTION_WORKFLOW_STATUS.PENDING) {
        steps['1'].status = 'success';
        steps['2'].status = 'pending';
        dispatchTransactionState({
          type: 'setWorkflowStage',
          payload: TRANSACTION_WORKFLOW_STATUS.CONFIRMED,
        });
        const txId = await deployTransaction();
        dispatchTransactionState({
          type: 'setDeployedTransactionId',
          payload: new ArweaveTransactionID(txId),
        });
        steps['2'].status = 'success';
        steps['3'].status = 'success';
        return;
      }
      if (direction === 'back' && TRANSACTION_WORKFLOW_STATUS.PENDING) {
        navigate(-1); // TODO: this should replace so our history
        return;
      }
    } catch (error) {
      eventEmitter.emit('error', error);
      resetToPending();
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
    if (pdntInteractionTypes.includes(interactionType as PDNTInteractionType)) {
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
    if (
      registryInteractionTypes.includes(
        interactionType as RegistryInteractionType,
      )
    ) {
      if (
        isObjectOfTransactionPayloadType<BuyRecordPayload>(
          payload,
          TRANSACTION_DATA_KEYS[interactionType].keys,
        )
      ) {
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
                    <b>{payload.name}</b>.{gateway} is yours!
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
    }
    // TODO implement other registry interactions
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
