import { StepProps, Steps } from 'antd';

import { useIsMobile } from '../../../../hooks';
import { AlertOctagonIcon, CheckIcon } from '../../../icons';
import './styles.css';

function StepProgressBar({
  stages,
  stage,
}: {
  stages: StepProps[];
  stage: number;
}) {
  const isMobile = useIsMobile();
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
            <CheckIcon
              fill={'var(--accent)'}
              width={isMobile ? '13px' : '16px'}
              height={isMobile ? '13px' : '16px'}
            />
          </span>
        );
      case 'error':
        return (
          <AlertOctagonIcon width={'18px'} height={'18px'} fill={'#444444'} />
        );
      case 'process':
        return (
          <span
            className="stage-circle flex"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--text-black)',
              border: '1px solid var(--accent)',
              alignItems: 'center',
              fontWeight: 700,
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                height: '30px',
              }}
            >
              {index + 1}
            </span>
          </span>
        );
      case 'wait':
        return (
          <span
            className="stage-circle flex"
            style={{
              fontWeight: 700,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                height: '30px',
              }}
            >
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
        responsive={false}
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
