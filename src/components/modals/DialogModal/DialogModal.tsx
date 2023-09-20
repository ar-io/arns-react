import { CloseIcon } from '../../icons';
import WorkflowButtons from '../../inputs/buttons/WorkflowButtons/WorkflowButtons';

function DialogModal({
  title = '',
  body,
  footer,
  showClose = true,
  cancelText,
  nextText,
  onClose = () => alert('onClose not set'),
  onCancel = () => alert('onCancel not set'),
  onNext = () => alert('onNext not set'),
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
        className="flex flex-column radius fade-in"
        style={{
          backgroundColor: 'var(--bg-color)',
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
              className="outline-button flex flex-center hover"
              style={{
                border: 'none',
                padding: '0px',
                minWidth: '0px',
              }}
              onClick={() => onClose()}
            >
              <CloseIcon width={'24px'} height={'px24'} fill="white" />
            </button>
          ) : (
            <></>
          )}
        </div>
        {/* body */}
        {body ? (
          <div
            className="flex flex-column flex-center"
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
            borderTop: '2px solid var(--text-faded)',
            boxSizing: 'border-box',
            height: '75px',
            bottom: 0,
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
            className="flex flex-row center"
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
