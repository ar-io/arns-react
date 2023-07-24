import { StepProps } from 'antd';

import { useIsMobile } from '../../../hooks';
import WorkflowButtons from '../../inputs/buttons/WorkflowButtons/WorkflowButtons';
import Loader from '../Loader/Loader';
import StepProgressBar from '../progress/Steps/Steps';

export type WorkflowStage = {
  header?: JSX.Element | string;
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
  const isMobile = useIsMobile();

  if (!stages) {
    return <Loader size={200} />;
  }

  return (
    <div
      className="flex flex-column center"
      style={isMobile ? {} : { gap: '10px', width: '100%' }}
    >
      {Object.entries(stages).map(([key, value], index) => {
        if (key === stage) {
          return (
            <div
              className="flex flex-column center"
              key={key}
              style={{ gap: 0 }}
            >
              {steps ? (
                <div className="flex flex-row" style={{ marginBottom: '30px' }}>
                  <StepProgressBar stage={index + 1} stages={steps} />
                </div>
              ) : (
                <></>
              )}
              {value.header ? (
                typeof value.header === 'string' ? (
                  <div
                    className="flex flex-row text-large white bold center"
                    style={{
                      height: '175px',
                      borderTop: 'solid 1px var(--text-faded)',
                    }}
                  >
                    {value.header}
                  </div>
                ) : (
                  value.header
                )
              ) : (
                <></>
              )}
              {value.component}
            </div>
          );
        }
      })}

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

      {footer ?? <></>}
    </div>
  );
}

export default Workflow;
