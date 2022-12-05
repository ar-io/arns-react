import { useEffect, useState } from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { WorkflowProps } from '../../../types';
import WorkflowButtons from '../../inputs/buttons/WorkflowButtons/WorkflowButtons';

function Workflow(props: WorkflowProps) {
  const { stages } = props;
  const [{ stage, isFirstStage, isLastStage, domain }, dispatchRegisterState] =
    useRegistrationState();
  const [currentComp, setCurrentComp] = useState(<></>);

  const [{ walletAddress, jwk, isSearching }, dispatchGlobalState] =
    useGlobalState();

  function showConnectWallet() {
    dispatchGlobalState({
      type: 'setConnectWallet',
      payload: true,
    });
  }

  useEffect(() => {
    Object.entries(stages).map(([key, value], index) => {
      if (index === stage) {
        return setCurrentComp(value.component);
      }
    });
  }, [stage]);

  return (
    <>
      {currentComp}
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
            showBack={true}
            showNext={true}
          />
        )}
      </>
    </>
  );
}

export default Workflow;
