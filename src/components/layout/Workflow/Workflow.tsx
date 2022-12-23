import React, { useEffect, useState } from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { WorkflowProps } from '../../../types';
import { MAX_LEASE_DURATION } from '../../../utils/constants';
import { isArNSDomainNameAvailable } from '../../../utils/searchUtils';
import WorkflowButtons from '../../inputs/buttons/WorkflowButtons/WorkflowButtons';

function Workflow({ stages }: WorkflowProps) {
  const [
    { stage, isFirstStage, isLastStage, antID, domain, leaseDuration, tier },
    dispatchRegisterState,
  ] = useRegistrationState();
  const [
    { walletAddress, isSearching, arnsSourceContract },
    dispatchGlobalState,
  ] = useGlobalState();

  const [nextCondition, setNextCondition] = useState<boolean>(false);
  const [backCondition, setBackCondition] = useState<boolean>(false);
  const [onNext, setOnNext] = useState<(id: string) => boolean>(() => true);

  useEffect(() => {
    Object.values(stages).map((value: any, index) => {
      if (index === stage) {
        setNextCondition(value.nextCondition);
        setBackCondition(value.backCondition);
        if (value.onNext) {
          setOnNext(() => value.onNext);
        }
        if (!value.onNext) {
          setOnNext(() => () => true);
        }
        return;
      }
    });
  }, [stage, stages]);

  async function handleNext() {
    const isOnNext = () => {
      if (domain && stage === 0) {
        return isArNSDomainNameAvailable({
          name: domain,
          records: arnsSourceContract.records,
        });
      }

      if (antID && domain && stage === 1) {
        return onNext(antID);
      }
      if (antID && domain && tier && leaseDuration && stage === 2) {
        return true;
      }
      return false;
    };
    if (!isLastStage && isOnNext()) {
      dispatchRegisterState({
        type: 'setStage',
        payload: stage + 1,
      });
      return;
    }
    return;
  }

  function showConnectWallet() {
    dispatchGlobalState({
      type: 'setShowConnectWallet',
      payload: true,
    });
  }

  return (
    <>
      {/* eslint-disable-next-line */}
      {Object.entries(stages).map(([key, value], index) => {
        if (index === stage) {
          return React.cloneElement(value.component, {
            key,
          });
        }
      })}
      <>
        {!isSearching ? (
          <></>
        ) : !walletAddress ? (
          <button className="accent-button hover" onClick={showConnectWallet}>
            Connect Wallet to proceed
          </button>
        ) : (
          <WorkflowButtons
            stage={stage}
            isFirstStage={isFirstStage}
            isLastStage={isLastStage}
            dispatch={dispatchRegisterState}
            showBack={backCondition}
            showNext={nextCondition}
            onNext={() => handleNext()}
          />
        )}
      </>
    </>
  );
}

export default Workflow;
