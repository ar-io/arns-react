import React from 'react';

import { useIsMobile } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import WorkflowButtons from '../../inputs/buttons/WorkflowButtons/WorkflowButtons';
import { StepProgressBar } from '../progress';

export type WorkflowProps = {
  stage: number;
  steps?: { [x: number]: { title: string; status: string } };
  onNext: () => void;
  onBack: () => void;
  footer?: JSX.Element[];
  stages: {
    [x: number]: {
      header?: JSX.Element;
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
};

function Workflow({
  stages,
  steps,
  onNext,
  onBack,
  stage,
  footer,
}: WorkflowProps) {
  const [{ walletAddress }, dispatchGlobalState] = useGlobalState();
  const isMobile = useIsMobile();

  function showConnectWallet() {
    dispatchGlobalState({
      type: 'setShowConnectWallet',
      payload: true,
    });
  }

  return (
    <div
      className="flex flex-column center"
      style={isMobile ? {} : { gap: '20px', width: '100%' }}
    >
      {Object.entries(stages).map(([key, value], index) => {
        if (index === stage) {
          return (
            <div key={key}>
              {value.header}
              {steps ? (
                <StepProgressBar stage={stage + 1} stages={steps} />
              ) : (
                <></>
              )}
              {value.component}
            </div>
          );
        }
      })}
      <>
        {stages[stage]?.requiresWallet && !walletAddress ? (
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
            customNextStyle={stages[stage].customNextStyle}
            customBackStyle={stages[stage].customBackStyle}
            backText={stages[stage].backText}
            nextText={stages[stage].nextText}
          />
        )}
        {footer ?? <></>}
      </>
    </div>
  );
}

export default Workflow;
