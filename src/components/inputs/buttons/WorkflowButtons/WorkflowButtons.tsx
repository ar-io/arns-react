import React from 'react';
import './styles.css';

function WorkflowButtons({
  customNextStyle = {},
  customBackStyle = {},
  backText,
  nextText,
  onNext,
  onBack,
  detail,
}: {
  customNextStyle?: React.CSSProperties;
  customBackStyle?: React.CSSProperties;
  backText?: string;
  nextText?: string;
  onBack?: () => void;
  onNext?: () => void;
  detail?: JSX.Element | string;
}) {
  return (
    <div className="flex flex-row justify-between items-center gap-5">
      {detail}
      <div className="flex flex-row gap-5">
        {backText && backText.length ? (
          <button
            className="button-secondary flex items-center justify-center"
            style={customBackStyle}
            disabled={!onBack}
            onClick={onBack ? () => onBack() : undefined}
          >
            {backText}
          </button>
        ) : null}
        {nextText && nextText.length ? (
          <button
            className={`button-primary flex items-center justify-center ${!onNext ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={customNextStyle}
            disabled={!onNext}
            onClick={onNext ? () => onNext() : undefined}
          >
            {nextText}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default WorkflowButtons;
