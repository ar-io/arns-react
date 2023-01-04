import React from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { WorkflowProps } from '../../../types';
import WorkflowButtons from '../../inputs/buttons/WorkflowButtons/WorkflowButtons';

function Workflow({ stages }: WorkflowProps) {
  const [
    { stage, isFirstStage, isLastStage, ...registrationState },
    dispatchRegisterState,
  ] = useRegistrationState();
  const [{ walletAddress, isSearching }, dispatchGlobalState] =
    useGlobalState();

  function handleNext() {
    dispatchRegisterState({
      type: 'setStage',
      payload: stage + 1,
    });
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
            showBack={true}
            showNext={stages[stage].showNextPredicate(registrationState)}
            handleNext={handleNext}
          />
        )}
      </>
    </>
  );
}

export default Workflow;
