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
  customNextStyle?: any;
  customBackStyle?: any;
  backText?: string;
  nextText?: string;
  onBack?: () => void;
  onNext?: () => void;
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
          {backText && backText.length ? (
            <button
              className="outline-button center"
              style={customBackStyle}
              disabled={!onBack}
              onClick={onBack ? () => onBack() : undefined}
            >
              {backText}
            </button>
          ) : (
            <></>
          )}
          {nextText && nextText.length ? (
            <button
              className={
                !onNext
                  ? 'accent-button disabled-button center'
                  : 'accent-button center'
              }
              style={customNextStyle}
              disabled={!onNext}
              onClick={onNext ? () => onNext() : undefined}
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
