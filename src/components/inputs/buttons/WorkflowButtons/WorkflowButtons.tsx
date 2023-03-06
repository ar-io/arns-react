import './styles.css';

function WorkflowButtons({
  showBack = true,
  showNext = true,
  customNextStyle,
  customBackStyle,
  backText = 'Back',
  nextText = 'Next',
  disableNext,
  disableBack,
  onNext,
  onBack,
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
}) {
  return (
    <>
      <div className="flex-row center" style={{ padding: '2em' }}>
        {showBack ? (
          <button
            className="outline-button"
            style={customBackStyle}
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
              disableNext ? 'accent-button disabled-button' : 'accent-button'
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
    </>
  );
}

export default WorkflowButtons;
