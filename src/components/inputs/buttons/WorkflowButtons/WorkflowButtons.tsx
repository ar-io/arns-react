import './styles.css';

function WorkflowButtons({
  showBack = true,
  showNext = true,
  disableNext,
  disableBack,
  onNext,
  onBack,
}: {
  showBack?: boolean;
  showNext?: boolean;
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
            disabled={disableBack}
            onClick={() => onBack()}
          >
            Back
          </button>
        ) : (
          <></>
        )}
        {showNext ? (
          <button
            className={
              disableNext ? 'accent-button disabled-button' : 'accent-button'
            }
            disabled={disableNext}
            onClick={() => onNext()}
          >
            Next
          </button>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}

export default WorkflowButtons;
