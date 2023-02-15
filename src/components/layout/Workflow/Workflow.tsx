import React from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { WorkflowProps } from '../../../types';
import WorkflowButtons from '../../inputs/buttons/WorkflowButtons/WorkflowButtons';

function Workflow({ stages, onNext, onBack, stage }: WorkflowProps) {
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
          />
        )}
      </>
    </>
  );
}

export default Workflow;
