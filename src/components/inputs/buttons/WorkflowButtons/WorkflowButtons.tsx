import { Tooltip as AntdTooltip } from 'antd';

import './styles.css';

function WorkflowButtons({
  customNextStyle = {},
  customBackStyle = {},
  backText,
  nextText,
  onNext,
  onBack,
  detail,
  nextButtonTooltip,
}: {
  customNextStyle?: any;
  customBackStyle?: any;
  backText?: string;
  nextText?: string;
  onBack?: () => void;
  onNext?: () => void;
  detail?: JSX.Element | string;
  /** Shown when the next button is disabled (e.g. purchases disabled for migration). */
  nextButtonTooltip?: string;
}) {
  const nextButton = (
    <button
      className={
        !onNext
          ? 'accent-button disabled-button center'
          : 'accent-button center'
      }
      style={customNextStyle}
      disabled={!onNext}
      onClick={onNext ? () => onNext() : undefined}
      data-testid="workflow-next-button"
    >
      {nextText}
    </button>
  );

  return (
    <>
      <div
        className="flex-row flex flex-space-between"
        style={{ boxSizing: 'border-box' }}
      >
        {detail}
        <div
          className="flex-row flex-right"
          style={{ padding: '0', boxSizing: 'border-box', gap: '20px' }}
        >
          {backText && backText.length ? (
            <button
              className="outline-button center"
              style={customBackStyle}
              disabled={!onBack}
              onClick={onBack ? () => onBack() : undefined}
              data-testid="workflow-back-button"
            >
              {backText}
            </button>
          ) : (
            <></>
          )}
          {nextText && nextText.length ? (
            nextButtonTooltip && !onNext ? (
              <AntdTooltip
                title={nextButtonTooltip}
                color="var(--box-color)"
                overlayInnerStyle={{ padding: '15px' }}
              >
                <span style={{ display: 'inline-block' }}>{nextButton}</span>
              </AntdTooltip>
            ) : (
              nextButton
            )
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
}

export default WorkflowButtons;
