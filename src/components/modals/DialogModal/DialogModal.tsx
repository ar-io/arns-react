import { CloseIcon } from '../../icons';
import WorkflowButtons from '../../inputs/buttons/WorkflowButtons/WorkflowButtons';

function DialogModal({
  title = '',
  body,
  footer,
  showClose = true,
  cancelText,
  nextText,
  onClose,
  onCancel,
  onNext,
}: {
  title?: string | JSX.Element;
  body?: string | JSX.Element;
  footer?: JSX.Element;
  showClose?: boolean; // shows x and divider for title
  cancelText?: string;
  nextText?: string;
  onClose?: () => void;
  onCancel?: () => void;
  onNext?: () => void;
}) {
  return (
    <>
      <div
        className="flex-column radius flex fade-in"
        style={{
          backgroundColor: '#1B1B1D',
          width: 'fit-content',
          padding: '0px 30px',
          paddingBottom: '0px',
          position: 'relative',
          gap: 0,
          justifyContent: 'space-between',
          border: '1px solid var(--text-faded)',
        }}
      >
        {/* title and close bar */}
        <div
          className="flex flex-row"
          style={{
            justifyContent: showClose ? 'space-between' : 'flex-start',
            alignItems: 'center',
            padding: '15px 0px',
            boxSizing: 'border-box',
          }}
        >
          <span
            className={
              showClose ? 'text faded center' : 'text-large white bold center'
            }
          >
            {title}
          </span>
          {showClose ? (
            <button
              className="outline-button flex-center hover flex"
              style={{
                border: 'none',
                padding: '0px',
                minWidth: '0px',
              }}
              onClick={onClose}
            >
              <CloseIcon width={'24px'} height={'24px'} fill="white" />
            </button>
          ) : (
            <></>
          )}
        </div>
        {/* body */}
        {body ? (
          <div
            className="flex-column flex-center flex"
            style={{ gap: 15, padding: '15px 0px', boxSizing: 'border-box' }}
          >
            {body}
          </div>
        ) : (
          <></>
        )}

        {/* footer */}
        <div
          className="flex flex-row"
          style={{
            justifyContent: footer ? 'space-between' : 'flex-end',
            alignItems: 'center',
            borderTop: '1px solid var(--text-faded)',
            boxSizing: 'border-box',
            bottom: 0,
            padding: '20px 0px',
          }}
        >
          {footer ? (
            <div
              className="flex"
              style={{
                width: '100%',
                height: 'fit-content',
                boxSizing: 'border-box',
              }}
            >
              {footer}
            </div>
          ) : (
            <></>
          )}
          {/* buttonainer */}
          <div
            className="center flex flex-row"
            style={{ width: 'fit-content', gap: '10px' }}
          >
            <WorkflowButtons
              nextText={nextText}
              backText={cancelText}
              onNext={onNext}
              onBack={onCancel}
              customBackStyle={{
                fontSize: '14px',
                fontWeight: 160,
                padding: '10px 16px',
                minWidth: 'fit-content',
              }}
              customNextStyle={{
                fontSize: '14px',
                fontWeight: 160,
                padding: '10px 16px',
                minWidth: 'fit-content',
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default DialogModal;
