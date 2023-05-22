import { StepProps } from 'antd';
import { useNavigate } from 'react-router';

import { useIsMobile } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import WorkflowButtons from '../../inputs/buttons/WorkflowButtons/WorkflowButtons';
import Loader from '../Loader/Loader';
import { StepProgressBar } from '../progress';

export type WorkflowStage = {
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

export type WorkflowProps = {
  stage: string;
  steps?: StepProps[];
  onNext: () => void;
  onBack: () => void;
  footer?: JSX.Element[];
  stages?: {
    [x: string]: WorkflowStage;
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
  const [{ walletAddress }] = useGlobalState();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  function showConnectWallet() {
    navigate('/connect');
  }

  if (!stages) {
    return <Loader size={200} />;
  }

  return (
    <div
      className="flex flex-column center"
      style={isMobile ? {} : { gap: 0, width: '100%', boxSizing: 'border-box' }}
    >
      {Object.entries(stages).map(([key, value], index) => {
        if (key === stage) {
          return (
            <div className="flex flex-column center" key={key}>
              {steps ? (
                <div
                  className="flex flex-row flex-center"
                  style={{
                    paddingBottom: 40,
                    borderBottom: value.header
                      ? 'solid 1px var(--text-faded)'
                      : '',
                  }}
                >
                  <StepProgressBar stage={index} stages={steps} />
                </div>
              ) : (
                <></>
              )}
              {value.header}
              {value.component}
            </div>
          );
        }
      })}
      <>
        {stages[stage]?.requiresWallet &&
        !walletAddress &&
        stages[stage]?.showNext ? (
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
