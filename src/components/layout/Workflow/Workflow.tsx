import React from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import WorkflowButtons from '../../inputs/buttons/WorkflowButtons/WorkflowButtons';

function Workflow({
  stages,
  onNext,
  onBack,
  stage,
}: {
  stage: number;
  onNext: () => void;
  onBack: () => void;
  stages: {
    [x: number]: {
      component: JSX.Element;
      showNext?: boolean;
      showBack?: boolean;
      disableNext?: boolean;
      requiresWallet?: boolean;
      customNextStyle?: any;
      customBackStyle?: any;
      backText?: string;
      nextText?: string;
    };
  };
}) {
  const [{ walletAddress }, dispatchGlobalState] = useGlobalState();

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
        {stages[stage].requiresWallet && !walletAddress ? (
          <div className="flex flex-row center" style={{ padding: '2em' }}>
            <button className="accent-button hover" onClick={showConnectWallet}>
              Connect Wallet to proceed
            </button>
          </div>
        ) : (
          <WorkflowButtons
            showBack={stages[stage].showBack}
            disableNext={stages[stage].disableNext}
            showNext={stages[stage].showNext}
            onNext={onNext}
            onBack={onBack}
            customNextStyle={
              stages[stage].customNextStyle ? stages[stage].customNextStyle : {}
            }
            customBackStyle={
              stages[stage].customBackStyle ? stages[stage].customBackStyle : {}
            }
            backText={
              stages[stage].backText ? stages[stage].backText : undefined
            }
            nextText={
              stages[stage].nextText ? stages[stage].nextText : undefined
            }
          />
        )}
      </>
    </>
  );
}

export default Workflow;
