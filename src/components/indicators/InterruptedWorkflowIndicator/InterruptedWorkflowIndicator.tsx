import { Tooltip } from '@src/components/data-display';
import { AlertTriangle } from 'lucide-react';
import './InterruptedWorkflowIndicator.css';

interface InterruptedWorkflowIndicatorProps {
  domainName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

function InterruptedWorkflowIndicator({
  domainName,
  className = '',
  size = 'md',
}: InterruptedWorkflowIndicatorProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <Tooltip
      tooltipOverrides={{
        overlayInnerStyle: {
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
        },
      }}
      message={
        <div className="text-xs">
          <div className="font-medium mb-1">Interrupted Workflow</div>
          <div>
            The marketplace listing for <strong>{domainName}</strong> was
            interrupted. Click to continue the workflow.
          </div>
        </div>
      }
      icon={
        <div className={`interrupted-workflow-indicator ${className}`}>
          <AlertTriangle
            className={`${sizeClasses[size]} text-error animate-pulse`}
          />
          <div className="red-ping-dot" />
        </div>
      }
    />
  );
}

export default InterruptedWorkflowIndicator;
