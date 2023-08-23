import { CheckCircleFilled } from '@ant-design/icons';
import { StepProps } from 'antd';
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
  buildSmartweaveInteractionTags,
  calculateFloorPrice,
  decodeDomainToASCII,
  getPDNSMappingByInteractionType,
  getWorkflowStepsForInteraction,
  isObjectOfTransactionPayloadType,
} from '../../../utils';
import {
  ATOMIC_FLAG,
  DEFAULT_PDNT_SOURCE_CODE_TX,
  MIN_TTL_SECONDS,
} from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import { PDNTCard } from '../../cards';
import { InfoIcon } from '../../icons';
import TransactionComplete from '../TransactionComplete/TransactionComplete';
import TransactionCost from '../TransactionCost/TransactionCost';
import Workflow, { WorkflowStage } from '../Workflow/Workflow';

export enum TRANSACTION_WORKFLOW_STATUS {
  PENDING = 'pending',
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
  const [{ walletAddress, pdnsSourceContract, pdnsContractId }] =
    useGlobalState();
  const [{ deployedTransactionId }, dispatchTransactionState] =
    useTransactionState();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const { assetId, functionName, ...payload } = transactionData;
  const navigate = useNavigate();
  const [steps, setSteps] = useState<StepProps[] | undefined>(() =>
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
  }, [workflowStage, deployedTransactionId, transactionData]);

  async function deployTransaction(): Promise<string | undefined> {
    try {
      let originalTxId: string | undefined = undefined;
      if (!walletAddress) {
        throw Error('No wallet connected.');
      }

      const validCreateInteraction =
        interactionType === INTERACTION_TYPES.CREATE &&
        isObjectOfTransactionPayloadType<CreatePDNTPayload>(
          payload,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.CREATE].keys,
        );
      const validBuyRecordInteraction =
        interactionType === INTERACTION_TYPES.BUY_RECORD &&
        isObjectOfTransactionPayloadType<BuyRecordPayload>(
          payload,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.BUY_RECORD].keys,
        );
      if (validCreateInteraction) {
        originalTxId = await arweaveDataProvider.deployContract({
          walletAddress,
          srcCodeTransactionId: new ArweaveTransactionID(
            payload.srcCodeTransactionId,
          ),
          initialState: payload.initialState,
          tags: payload?.tags,
        });
      } else if (
        validBuyRecordInteraction &&
        payload.contractTxId === ATOMIC_FLAG &&
        payload.state
      ) {
        if (payload.targetId) {
          payload.state.records['@'] = {
            transactionId: payload.targetId.toString(),
            ttlSeconds: MIN_TTL_SECONDS,
            maxUndernames: 100,
          };
        }
        const writeInteractionId = await arweaveDataProvider.registerAtomicName(
          {
            walletAddress,
            registryId: pdnsContractId,
            srcCodeTransactionId: new ArweaveTransactionID(
              DEFAULT_PDNT_SOURCE_CODE_TX,
            ),
            initialState: payload.state,
            domain: payload.name,
            reservedList: Object.keys(pdnsSourceContract.reserved),
            type: payload.type,
            years: payload.years,
          },
        );

        originalTxId = writeInteractionId?.toString();
      } else {
        const writeInteractionId = await arweaveDataProvider.writeTransaction({
          walletAddress,
          contractTxId: new ArweaveTransactionID(assetId),
          dryWrite: true,
          payload: {
            function: functionName,
            ...payload,
          },
          tags:
            validBuyRecordInteraction &&
            payload.contractTxId !== ATOMIC_FLAG &&
            payload.targetId
              ? buildSmartweaveInteractionTags({
                  contractId: new ArweaveTransactionID(payload.contractTxId),
                  input: {
                    function: 'setRecord',
                    subDomain: '@',
                    transactionId: payload.targetId,
                    ttlSeconds: MIN_TTL_SECONDS, // TODO: remove, ttl seconds no longer supported
                  },
                })
              : undefined,
        });
        originalTxId = writeInteractionId?.toString();
      }
      if (!originalTxId) {
        throw Error('Unable to create transaction');
      }
      return originalTxId;
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

  function resetToPending() {
    if (!steps) {
      return;
    }
    steps[0].status = 'process';
    steps[1].status = 'wait';
    steps[2].status = 'wait';
    dispatchTransactionState({
      type: 'setWorkflowStage',
      payload: TRANSACTION_WORKFLOW_STATUS.PENDING,
    });
  }

  async function handleStage(direction: string) {
    try {
      if (!steps) {
        throw new Error('No steps found');
      }
      if (direction === 'next' && TRANSACTION_WORKFLOW_STATUS.PENDING) {
        steps[0].status = 'finish';
        steps[1].status = 'process';

        const txId = await deployTransaction();
        if (!txId) {
          throw new Error(`Failed to deploy transaction`);
        }
        dispatchTransactionState({
          type: 'setDeployedTransactionId',
          payload: new ArweaveTransactionID(txId),
        });
        steps[1].status = 'finish';
        steps[2].status = 'finish';
        dispatchTransactionState({
          type: 'setWorkflowStage',
          payload: TRANSACTION_WORKFLOW_STATUS.SUCCESSFUL,
        });

        setSteps(undefined);
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
          component: (
            <div
              className="flex flex-column"
              style={{ marginBottom: '30px', gap: '0px' }}
            >
              <PDNTCard {...pdntProps} />
              <TransactionCost />
            </div>
          ),
          header: `Review your ${interactionType} action`,
          nextText: 'Confirm',
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
            <div
              className="flex flex-row center radius"
              style={{
                width: '700px',
                height: '90px',
                background: '#213027',
                border: '1px solid #44AF69',
                fontSize: '18px',
                marginBottom: '20px',
              }}
            >
              <span className="white center">
                <CheckCircleFilled
                  style={{ fontSize: 18, color: 'var(--success-green)' }}
                />
                &nbsp;
                <b>{interactionType}</b> success!
              </span>
            </div>
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
    if (
      registryInteractionTypes.includes(
        interactionType as RegistryInteractionType,
      )
    ) {
      if (
        isObjectOfTransactionPayloadType<BuyRecordPayload>(
          payload,
          TRANSACTION_DATA_KEYS[interactionType].keys,
        ) &&
        pdnsSourceContract.settings.auctions
      ) {
        return {
          pending: {
            component: (
              <div
                className="flex flex-column"
                style={{ marginBottom: '30px', gap: '0px' }}
              >
                <PDNTCard {...pdntProps} />
                <TransactionCost
                  fee={{
                    io:
                      calculateFloorPrice({
                        domain: payload.name,
                        registrationType: payload.type,
                        // TODO: setup cost for permabuy
                        years: payload.years ?? 1,
                        auctionSettings: pdnsSourceContract.settings.auctions,
                        fees: pdnsSourceContract.fees,
                      }) ?? 0,
                  }}
                  info={
                    <div
                      className="flex flex-row flex-left"
                      style={{
                        gap: '10px',
                        maxWidth: '50%',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                      }}
                    >
                      <InfoIcon
                        width={'20px'}
                        height={'20px'}
                        fill="var(--text-grey)"
                      />
                      <span
                        className="flex flex-column flex-left grey text"
                        style={{ textAlign: 'left', lineHeight: '1.5em' }}
                      >
                        This includes a registration fee (paid in IO tokens) and
                        the Arweave network fee (paid in AR tokens).
                      </span>
                    </div>
                  }
                />
              </div>
            ),
            header: `Review your ${payload.auction ? 'Auction' : 'Purchase'}`,
            nextText: 'Confirm',
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
              <div
                className="flex flex-row center radius"
                style={{
                  width: '700px',
                  height: '90px',
                  background: '#213027',
                  border: '1px solid #44AF69',
                  fontSize: '18px',
                  marginBottom: '2em',
                }}
              >
                <span className="white center">
                  <CheckCircleFilled
                    style={{ fontSize: 18, color: 'var(--success-green)' }}
                  />
                  &nbsp;<b>{decodeDomainToASCII(payload.name)}</b> is yours!
                </span>
              </div>
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
        steps={
          workflowStage === TRANSACTION_WORKFLOW_STATUS.SUCCESSFUL
            ? undefined
            : steps
        }
        stages={stages}
      />
    </>
  );
}

export default TransactionWorkflow;
