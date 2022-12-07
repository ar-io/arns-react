import { useEffect, useState } from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { WorkflowProps } from '../../../types';
import WorkflowButtons from '../../inputs/buttons/WorkflowButtons/WorkflowButtons';

function Workflow({ stages }: WorkflowProps) {
  const [{ stage, isFirstStage, isLastStage }, dispatchRegisterState] =
    useRegistrationState();
  const [{ walletAddress, jwk, isSearching }, dispatchGlobalState] =
    useGlobalState();

  const [nextCondition, setNextCondition] = useState<boolean>(false);
  const [backCondition, setBackCondition] = useState<boolean>(false);

  useEffect(() => {
    // eslint-disable-next-line
    Object.entries(stages).map(([key, value], index) => {
      if (index === stage) {
        setNextCondition(value.nextCondition);
        setBackCondition(value.backCondition);
        return;
      }
    });
  }, [stage, stages]);

  function showConnectWallet() {
    dispatchGlobalState({
      type: 'setConnectWallet',
      payload: true,
    });
  }

  return (
    <>
      {/* eslint-disable-next-line */}
      {Object.entries(stages).map(([key, value], index) => {
        if (index === stage) {
          return value.component;
        }
      })}
      <>
        {!isSearching ? (
          <button className="accentButton hover">Take the quick Tour</button>
        ) : !walletAddress && !jwk ? (
          <button className="accentButton hover" onClick={showConnectWallet}>
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
          />
        )}
      </>
    </>
  );
}

export default Workflow;
