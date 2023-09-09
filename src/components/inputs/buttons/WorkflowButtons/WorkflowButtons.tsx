import './styles.css';

function WorkflowButtons({
  showBack = true,
  showNext = true,
  customNextStyle = {},
  customBackStyle = {},
  backText = 'Back',
  nextText = 'Next',
  disableNext,
  disableBack,
  onNext,
  onBack,
  detail,
}: {
  showBack?: boolean;
  showNext?: boolean;
  customNextStyle?: any;
  customBackStyle?: any;
  backText?: string;
  nextText?: string;
  disableNext?: boolean;
  disableBack?: boolean;
  onBack: () => void;
  onNext: () => void;
  detail?: JSX.Element | string;
}) {
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
          {showBack ? (
            <button
              className="outline-button center"
              style={{
                borderColor: 'var(--text-faded)',
                color: 'var(--text-grey)',
                ...customBackStyle,
              }}
              disabled={disableBack}
              onClick={() => onBack()}
            >
              {backText}
            </button>
          ) : (
            <></>
          )}
          {showNext ? (
            <button
              className={
                disableNext
                  ? 'accent-button disabled-button center'
                  : 'accent-button center'
              }
              style={customNextStyle}
              disabled={disableNext}
              onClick={() => onNext()}
            >
              {nextText}
            </button>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
}

export default WorkflowButtons;
