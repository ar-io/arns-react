import { CheckCircleOutlined } from '@ant-design/icons';
import { StepProps, Steps } from 'antd';

import { AlertOctagonIcon } from '../../../icons';
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
          <CheckCircleOutlined style={{ color: '#FFBB38', fontSize: 32 }} />
        );
      case 'error':
        return (
          <AlertOctagonIcon width={'18px'} height={'18px'} fill={'#444444'} />
        );
      case 'process':
        return (
          <span
            className="progress-stage-circle"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--text-black)',
              border: 'none',
            }}
          >
            {index + 1}
          </span>
        );
      case 'wait':
        return <span className="progress-stage-circle">{index + 1}</span>;
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
