import { StepProps } from 'antd';

import { useIsMobile } from '../../../hooks';
import WorkflowButtons from '../../inputs/buttons/WorkflowButtons/WorkflowButtons';
import { StepProgressBar } from '../progress';
import PageLoader from '../progress/PageLoader/PageLoader';

export type WorkflowStage = {
  header?: JSX.Element | string;
  component: JSX.Element;
  requiresWallet?: boolean;
  customNextStyle?: any;
  customBackStyle?: any;
  backText?: string;
  nextText?: string;
  onBack?: () => void;
  onNext?: () => void;
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
    return <PageLoader loading={!stages} message={'Loading Workflow stages'} />;
  }

  return (
    <div
      id="workflow-container"
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
              {steps && steps.length ? (
                <div
                  className="flex flex-row"
                  style={{ marginBottom: '30px', width: '100%' }}
                >
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
                      height: '100%',
                      padding: '80px 0px',
                      borderTop: steps?.length
                        ? 'solid 1px var(--text-faded)'
                        : '',
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
        onNext={onNext}
        onBack={onBack}
        customNextStyle={stages[stage].customNextStyle}
        customBackStyle={stages[stage].customBackStyle}
        backText={stages[stage]?.backText}
        nextText={stages[stage]?.nextText}
      />

      {footer ?? <></>}
    </div>
  );
}

export default Workflow;
