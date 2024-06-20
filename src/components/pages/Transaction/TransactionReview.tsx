import { IOWriteable } from '@ar.io/sdk/web';
import { ANTCard } from '@src/components/cards';
import { InfoIcon } from '@src/components/icons';
import WorkflowButtons from '@src/components/inputs/buttons/WorkflowButtons/WorkflowButtons';
import TransactionCost from '@src/components/layout/TransactionCost/TransactionCost';
import { StepProgressBar } from '@src/components/layout/progress';
import PageLoader from '@src/components/layout/progress/PageLoader/PageLoader';
import { useIsMobile } from '@src/hooks';
import dispatchArIOInteraction from '@src/state/actions/dispatchArIOInteraction';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { useTransactionState } from '@src/state/contexts/TransactionState';
import { useWalletState } from '@src/state/contexts/WalletState';
import {
  ARNSMapping,
  ARNS_INTERACTION_TYPES,
  TransactionData,
  ValidInteractionType,
} from '@src/types';
import {
  getARNSMappingByInteractionType,
  getWorkflowStepsForInteraction,
} from '@src/utils';
import eventEmitter from '@src/utils/events';
import { StepProps } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getTransactionDescription } from './transaction-descriptions';
import { getTransactionHeader } from './transaction-headers';

// page on route transaction/review
// on completion routes to transaction/complete
function TransactionReview() {
  const navigate = useNavigate();
  const [{ ioTicker, arioContract, arnsContractId }] = useGlobalState();
  const [{ walletAddress, wallet }] = useWalletState();
  const [
    { workflowName, interactionType, transactionData, interactionResult },
    dispatchTransactionState,
  ] = useTransactionState();
  const isMobile = useIsMobile();
  const [antProps, setAntProps] = useState<ARNSMapping>();
  const [steps, setSteps] = useState<StepProps[] | undefined>(
    getWorkflowStepsForInteraction(interactionType),
  );
  const [header, setHeader] = useState<string | JSX.Element | undefined>(
    getTransactionHeader({
      workflowName: workflowName as ARNS_INTERACTION_TYPES,
    }),
  );
  const [transactionDescription, setTransactionDescription] = useState(
    getTransactionDescription({
      workflowName: workflowName as ARNS_INTERACTION_TYPES,
      ioTicker,
    }),
  );

  useEffect(() => {
    if (!transactionData && !workflowName) {
      navigate('/');
      return;
    }
    setAntProps(
      getARNSMappingByInteractionType({
        interactionType: interactionType as ValidInteractionType,
        transactionData: {
          ...transactionData,
          deployedTransactionId: interactionResult?.id,
        } as any as TransactionData,
      }) as ARNSMapping,
    );
    setTransactionDescription(
      getTransactionDescription({
        workflowName: workflowName as ARNS_INTERACTION_TYPES,
        ioTicker,
      }),
    );
    setSteps(getWorkflowStepsForInteraction(interactionType));
    setHeader(
      getTransactionHeader({
        workflowName: workflowName as ARNS_INTERACTION_TYPES,
      }),
    );
  }, [
    transactionData,
    interactionResult,
    workflowName,
    interactionType,
    walletAddress,
  ]);

  async function handleNext() {
    try {
      if (!(arioContract instanceof IOWriteable)) {
        throw new Error('Wallet must be connected to dispatch transactions.');
      }
      if (!transactionData || !workflowName) {
        throw new Error('Transaction data is missing');
      }

      if (!walletAddress) {
        throw new Error('Wallet address is missing');
      }
      // TODO: check that it's connected
      await dispatchArIOInteraction({
        arioContract: arioContract,
        workflowName: workflowName as ARNS_INTERACTION_TYPES,
        payload: transactionData,
        owner: walletAddress,
        processId: arnsContractId,
        dispatch: dispatchTransactionState,
        signer: wallet?.arconnectSigner,
      });

      navigate('/transaction/complete');
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

  if (!antProps) {
    return (
      <PageLoader loading={true} message={'Loading transaction data...'} />
    );
  }

  return (
    <div className="page">
      <div
        className="flex flex-column center"
        style={isMobile ? {} : { gap: '0px', maxWidth: '900px', width: '100%' }}
      >
        {steps && steps.length ? (
          <div
            className="flex flex-row"
            style={{
              marginBottom: '30px',
              width: '100%',
            }}
          >
            <StepProgressBar stage={3} stages={steps} />
          </div>
        ) : (
          <></>
        )}

        {typeof header === 'string' ? (
          <div
            className="flex flex-row text-large white bold center"
            style={{
              height: '100%',
              padding: '80px 0px',
              borderTop: steps?.length ? 'solid 1px var(--text-faded)' : '',
            }}
          >
            {header}
          </div>
        ) : (
          header
        )}
        <ANTCard {...antProps} bordered compact={false} />
        <TransactionCost
          fee={{
            [ioTicker]: transactionData?.interactionPrice,
          }}
          info={
            transactionDescription && (
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
                  {transactionDescription}
                </span>
              </div>
            )
          }
        />
        <div
          className="flex"
          style={{
            marginTop: 20,
            width: '100%',
            justifyContent: 'flex-end',
          }}
        >
          <WorkflowButtons
            onNext={() => handleNext()}
            onBack={() => navigate(-1)}
            backText={'Back'}
            nextText={'Confirm'}
          />
        </div>
      </div>
    </div>
  );
}

export default TransactionReview;
