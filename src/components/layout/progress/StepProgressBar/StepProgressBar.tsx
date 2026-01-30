import { Steps, StepProps } from '@src/components/ui/Steps';
import { useIsMobile } from '../../../../hooks';
import { AlertOctagonIcon, CheckIcon } from '../../../icons';
import './styles.css';

interface StepProgressBarProps {
  stages: Array<{
    title?: React.ReactNode;
    description?: React.ReactNode;
    status?: 'wait' | 'process' | 'finish' | 'error';
  }>;
  stage: number;
}

function StepProgressBar({ stages, stage }: StepProgressBarProps) {
  const isMobile = useIsMobile();

  const items: StepProps[] = stages.map((step, index) => {
    const status = step.status || (index < stage ? 'finish' : index === stage ? 'process' : 'wait');
    
    let icon: React.ReactNode = undefined;
    
    switch (status) {
      case 'finish':
        icon = (
          <span className="flex items-center justify-center size-8 rounded-full border border-primary text-primary">
            <CheckIcon
              fill="currentColor"
              width={isMobile ? '13px' : '16px'}
              height={isMobile ? '13px' : '16px'}
            />
          </span>
        );
        break;
      case 'error':
        icon = (
          <span className="flex items-center justify-center size-8 rounded-full border border-error text-error">
            <AlertOctagonIcon width="18px" height="18px" fill="currentColor" />
          </span>
        );
        break;
      case 'process':
        icon = (
          <span className="flex items-center justify-center size-8 rounded-full bg-primary border border-primary text-primary-foreground font-bold text-sm">
            {index + 1}
          </span>
        );
        break;
      case 'wait':
        icon = (
          <span className="flex items-center justify-center size-8 rounded-full border border-muted text-muted font-bold text-sm">
            {index + 1}
          </span>
        );
        break;
    }

    return {
      title: step.title,
      description: step.description,
      status,
      icon,
    };
  });

  return (
    <Steps
      current={stage}
      items={items}
      size={isMobile ? 'sm' : 'md'}
    />
  );
}

export default StepProgressBar;
