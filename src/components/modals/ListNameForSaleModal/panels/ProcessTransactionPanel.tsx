import VerticalTimelineStepper from '@src/components/data-display/VerticalTimelineStepper';
import { ReactNode } from 'react';

export type ProcessTransactionPanelProps = {
  domainName: string;
  workflowSteps: Record<
    string,
    {
      title: ReactNode;
      description: ReactNode;
      icon: ReactNode;
    }
  >;
  isComplete: boolean;
  hasError: boolean;
  onClose: () => void;
};

function ProcessTransactionPanel({
  domainName,
  workflowSteps,
  isComplete,
  hasError,
  onClose,
}: ProcessTransactionPanelProps) {
  return (
    <div className="flex flex-col p-6 gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium text-white">
          {isComplete
            ? hasError
              ? 'Listing Failed'
              : 'Listing Complete!'
            : 'Processing Listing...'}
        </h3>
        <p className="text-sm text-grey">
          {isComplete
            ? hasError
              ? `There was an error listing ${domainName}. Please try again.`
              : `${domainName} has been listed on the marketplace.`
            : `Please wait while we list ${domainName} on the marketplace. Do not close this window.`}
        </p>
      </div>

      {/* Timeline Stepper */}
      <div className="flex flex-col bg-foreground rounded-lg p-6">
        <VerticalTimelineStepper steps={workflowSteps} />
      </div>

      {/* Action Button - Only show when complete */}
      {isComplete && (
        <div className="flex justify-end">
          <button
            className={`px-6 py-3 rounded transition-colors ${
              hasError
                ? 'bg-transparent border border-grey text-white hover:bg-grey hover:bg-opacity-20'
                : 'bg-primary text-black hover:bg-primary-dark'
            }`}
            onClick={onClose}
          >
            {hasError ? 'Close' : 'Done'}
          </button>
        </div>
      )}
    </div>
  );
}

export default ProcessTransactionPanel;
