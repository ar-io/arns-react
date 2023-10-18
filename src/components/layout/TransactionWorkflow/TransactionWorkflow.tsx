import { CheckCircleFilled } from '@ant-design/icons';
import { StepProps } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import {
  ArweaveTransactionID,
  BuyRecordPayload,
  ExcludedValidInteractionType,
  ExtendLeasePayload,
  INTERACTION_TYPES,
  IncreaseUndernamesPayload,
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
  decodeDomainToASCII,
  getPDNSMappingByInteractionType,
  getWorkflowStepsForInteraction,
  isObjectOfTransactionPayloadType,
  pruneExtraDataFromTransactionPayload,
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
import PageLoader from '../progress/PageLoader/PageLoader';

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
  const [{ walletAddress, pdnsContractId, arweaveDataProvider }] =
    useGlobalState();
  const [{ deployedTransactionId }, dispatchTransactionState] =
    useTransactionState();
  const { assetId, functionName, ...payload } = transactionData;
  const navigate = useNavigate();
  const [currentInteractionType, setCurrentInteractionType] =
    useState<ExcludedValidInteractionType>();
  const [steps, setSteps] = useState<StepProps[] | undefined>();
  const [stages, setStages] = useState<
    { [x: string]: WorkflowStage } | undefined
  >();
  const [pdntProps, setPdntProps] = useState(() =>
    getPDNSMappingByInteractionType({
      interactionType,
      transactionData,
    }),
  );
  const [deployingTransaction, setDeployingTransaction] =
    useState<boolean>(false);

  useEffect(() => {
    onLoad(interactionType);
  }, [workflowStage, deployedTransactionId, transactionData]);

  function onLoad(type?: ExcludedValidInteractionType) {
    try {
      if (!type && !currentInteractionType) {
        throw new Error('Unable to get transaction type.');
      }
      if (type) {
        setCurrentInteractionType(type);
        setSteps(getWorkflowStepsForInteraction(type));
        const newStages = getStagesByTransactionType({
          interactionType: type,
        });
        if (newStages) setStages(newStages);
        const newPdntProps = getPDNSMappingByInteractionType({
          interactionType: type,
          transactionData,
        });
        if (newPdntProps) {
          setPdntProps(newPdntProps);
        }
      }
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

  async function deployTransaction(
    type: ExcludedValidInteractionType,
  ): Promise<string | undefined> {
    try {
      setDeployingTransaction(true);
      let originalTxId: string | undefined = undefined;
      if (!walletAddress) {
        throw Error('No wallet connected.');
      }

      const validBuyRecordInteraction =
        interactionType === INTERACTION_TYPES.BUY_RECORD &&
        isObjectOfTransactionPayloadType<BuyRecordPayload>(
          payload,
          TRANSACTION_DATA_KEYS[INTERACTION_TYPES.BUY_RECORD].keys,
        );

      if (
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
            type: payload.type,
            years: payload.years,
            auction: payload.auction ?? false,
            qty: payload.qty,
          },
        );

        originalTxId = writeInteractionId?.toString();
      } else {
        const cleanPayload = pruneExtraDataFromTransactionPayload(
          type,
          payload,
        );
        const writeInteractionId = await arweaveDataProvider.writeTransaction({
          walletAddress,
          contractTxId: new ArweaveTransactionID(assetId),
          dryWrite: true,
          payload: {
            function: functionName,
            ...cleanPayload,
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
    } finally {
      setDeployingTransaction(false);
    }
  }

  function resetToPending() {
    if (!steps?.length) {
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
      if (steps?.length) {
        steps[0].status = 'finish';
        steps[1].status = 'process';
      }
      if (
        direction === 'next' &&
        TRANSACTION_WORKFLOW_STATUS.PENDING &&
        interactionType
      ) {
        const txId = await deployTransaction(interactionType);
        if (!txId) {
          throw new Error(`Failed to deploy transaction`);
        }
        dispatchTransactionState({
          type: 'setDeployedTransactionId',
          payload: new ArweaveTransactionID(txId),
        });
        if (steps?.length) {
          steps[1].status = 'finish';
          steps[2].status = 'finish';
        }
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

  // TODO: [PE-4631] this should be mapped and broken down into seperate files with tests for each interaction type

  function getStagesByTransactionType({
    interactionType,
  }: {
    interactionType: ValidInteractionType;
  }): { [x: string]: WorkflowStage } | undefined {
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
              <PDNTCard {...pdntProps} bordered />
              <TransactionCost />
            </div>
          ),
          header: `Review your ${interactionType} action`,
          backText: 'Back',
          nextText: 'Confirm',
          onBack: () => navigate(-1),
        },
        successful: {
          component: (
            <TransactionComplete
              transactionId={deployedTransactionId}
              interactionType={interactionType}
              transactionData={transactionData}
            />
          ),
          header: (
            <div
              className="flex flex-row center radius"
              style={{
                width: '700px',
                height: '90px',
                background: 'var(--green-bg)',
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
        },
      };
    }
    if (
      registryInteractionTypes.includes(
        interactionType as RegistryInteractionType,
      )
    ) {
      if (
        interactionType === INTERACTION_TYPES.BUY_RECORD &&
        isObjectOfTransactionPayloadType<BuyRecordPayload>(
          payload,
          TRANSACTION_DATA_KEYS[interactionType].keys,
        )
      ) {
        return {
          pending: {
            component: (
              <div
                className="flex flex-column"
                style={{ marginBottom: '30px', gap: '0px' }}
              >
                <PDNTCard {...pdntProps} bordered compact={false} />
                <TransactionCost
                  fee={{
                    // TODO: this scares me - we need to make sure we are using the correct fee
                    io: payload.qty,
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
            backText: 'Back',
            nextText: 'Confirm',
            onBack: () => navigate(-1),
          },
          successful: {
            component: (
              <TransactionComplete
                transactionId={deployedTransactionId}
                interactionType={interactionType}
                transactionData={transactionData}
              />
            ),
            header: (
              <div
                className="flex flex-row center radius"
                style={{
                  width: '700px',
                  height: '90px',
                  background: 'var(--green-bg)',
                  border: '1px solid #44AF69',
                  fontSize: '18px',
                  marginBottom: '2em',
                }}
              >
                <span className="flex white center" style={{ gap: '8px' }}>
                  <span>
                    <CheckCircleFilled
                      style={{ fontSize: 18, color: 'var(--success-green)' }}
                    />
                  </span>
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
          },
        };
      }
      if (
        interactionType === INTERACTION_TYPES.INCREASE_UNDERNAMES &&
        isObjectOfTransactionPayloadType<IncreaseUndernamesPayload>(
          payload,
          TRANSACTION_DATA_KEYS[interactionType].keys,
        )
      ) {
        return {
          pending: {
            component: (
              <div
                className="flex flex-column"
                style={{ marginBottom: '30px', gap: '0px' }}
              >
                <PDNTCard {...pdntProps} bordered />
                <TransactionCost
                  fee={{
                    io: payload.qty,
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
                        Increasing your undernames is paid in IO tokens, and an
                        Arweave network fee paid in AR tokens.
                      </span>
                    </div>
                  }
                />
              </div>
            ),
            header: (
              <h1
                className="flex white"
                style={{ width: '100%', paddingBottom: '30px' }}
              >
                Review
              </h1>
            ),
            backText: 'Back',
            nextText: 'Confirm',
            onBack: () => navigate(-1),
          },
          successful: {
            component: (
              <TransactionComplete
                transactionId={deployedTransactionId}
                interactionType={interactionType}
                transactionData={transactionData}
              />
            ),
            header: (
              <div
                className="flex flex-row center radius"
                style={{
                  width: '700px',
                  height: '90px',
                  background: 'var(--green-bg)',
                  border: '1px solid #44AF69',
                  fontSize: '18px',
                  marginBottom: '2em',
                }}
              >
                <span className="flex white center" style={{ gap: '8px' }}>
                  <span>
                    <CheckCircleFilled
                      style={{ fontSize: 18, color: 'var(--success-green)' }}
                    />
                  </span>
                  &nbsp;Undernames Increased
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
          },
        };
      }

      if (
        interactionType === INTERACTION_TYPES.EXTEND_LEASE &&
        isObjectOfTransactionPayloadType<ExtendLeasePayload>(
          payload,
          TRANSACTION_DATA_KEYS[interactionType].keys,
        )
      ) {
        return {
          pending: {
            component: (
              <div
                className="flex flex-column"
                style={{ marginBottom: '30px', gap: '0px' }}
              >
                <PDNTCard {...pdntProps} bordered />
                <TransactionCost
                  fee={{
                    io: payload.qty,
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
            header: (
              <h1
                className="flex white"
                style={{ width: '100%', paddingBottom: '30px' }}
              >
                Review
              </h1>
            ),
            backText: 'Back',
            nextText: 'Confirm',
            onBack: () => navigate(-1),
          },
          successful: {
            component: (
              <TransactionComplete
                transactionId={deployedTransactionId}
                interactionType={interactionType}
                transactionData={transactionData}
              />
            ),
            header: (
              <div
                className="flex flex-row center radius"
                style={{
                  width: '700px',
                  height: '90px',
                  background: 'var(--green-bg)',
                  border: '1px solid #44AF69',
                  fontSize: '18px',
                  marginBottom: '2em',
                }}
              >
                <span className="flex white center" style={{ gap: '8px' }}>
                  <span>
                    <CheckCircleFilled
                      style={{ fontSize: 18, color: 'var(--success-green)' }}
                    />
                  </span>
                  &nbsp;Your lease has been extended
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
          },
        };
      }
    }
  }

  return (
    <>
      <PageLoader
        message={'Deploying transaction...'}
        loading={deployingTransaction}
      />
      <div style={{ maxWidth: '900px' }}>
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
      </div>
    </>
  );
}

export default TransactionWorkflow;
