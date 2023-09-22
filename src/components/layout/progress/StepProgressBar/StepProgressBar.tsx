import { StepProps, Steps } from 'antd';

import { AlertOctagonIcon, CheckIcon } from '../../../icons';
import './styles.css';

function StepProgressBar({
  stages,
  stage,
}: {
  stages: StepProps[];
  stage: number;
}) {
  function handleIcon(status: string | undefined, index: number) {
    switch (status) {
      case 'finish':
        return (
          <span
            className="stage-circle"
            style={{
              color: 'var(--text-black)',
              border: '1px solid var(--accent)',
            }}
          >
            <CheckIcon fill={'var(--accent)'} width={'16px'} height={'16px'} />
          </span>
        );
      case 'error':
        return (
          <AlertOctagonIcon width={'18px'} height={'18px'} fill={'#444444'} />
        );
      case 'process':
        return (
          <span
            className="stage-circle"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--text-black)',
              border: '1px solid var(--accent)',
              alignItems: 'center',
              fontWeight: 500,
              position: 'relative',
            }}
          >
            <span style={{ position: 'absolute', top: '0px', bottom: '0px' }}>
              {index + 1}
            </span>
          </span>
        );
      case 'wait':
        return (
          <span
            className="stage-circle"
            style={{ fontFamily: 'Rubik-Bold', position: 'relative' }}
          >
            {' '}
            <span style={{ position: 'absolute', top: '0px', bottom: '0px' }}>
              {index + 1}
            </span>
          </span>
        );
      default:
        return undefined;
    }
  }
  return (
    <>
      <Steps
        current={stage}
        items={
          stages.map((step, index) => {
            return {
              ...step,
              className: `step-${step.status}`,
              icon: handleIcon(step.status, index),
            };
          }) ?? []
        }
      />
    </>
  );
}

export default StepProgressBar;
