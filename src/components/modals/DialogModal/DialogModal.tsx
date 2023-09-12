import { CloseIcon } from '../../icons';

function DialogModal({
  title = '',
  body,
  footer,
  showClose = true,
  showNext = true,
  showCancel = true,
  cancelText = 'Cancel',
  nextText = 'Next',
  onClose = () => alert('onClose not set'),
  onCancel = () => alert('onCancel not set'),
  onNext = () => alert('onNext not set'),
}: {
  title?: string | JSX.Element;
  body?: string | JSX.Element;
  footer?: JSX.Element;
  showClose?: boolean; // shows x and divider for title
  showNext?: boolean;
  showCancel?: boolean;
  cancelText?: string;
  nextText?: string;
  onClose?: () => void;
  onCancel?: () => void;
  onNext?: () => void;
}) {
  return (
    <>
      <div
        className="flex flex-column card"
        style={{
          width: '400px',
          height: 'fit-content',
          padding: 0,
          paddingBottom: 75,
          position: 'relative',
          gap: 0,
        }}
      >
        {/* title and close bar */}
        <div
          className="flex flex-row"
          style={{
            justifyContent: showClose ? 'space-between' : 'flex-start',
            alignItems: 'center',
            borderBottom: showClose ? '2px solid #323232' : 'none',
            padding: '15px 30px',
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
                width: 20,
                height: 20,
                padding: 0,
              }}
              onClick={() => onClose()}
            >
              <CloseIcon width={14} height={14} fill="white" />
            </button>
          ) : (
            <></>
          )}
        </div>
        {/* body */}
        {body ? (
          <div
            className="flex flex-column flex-center"
            style={{ gap: 15, padding: '15px 30px', boxSizing: 'border-box' }}
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
            borderTop: '2px solid #323232',
            padding: '15px 20px',
            boxSizing: 'border-box',
            height: '75px',
            position: 'absolute',
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
            {showCancel ? (
              <button
                className="outline-button center"
                onClick={() => onCancel()}
                style={{
                  width: 'fit-content',
                  height: 20,
                  borderRadius: 3,
                  padding: 15,
                }}
              >
                {cancelText}
              </button>
            ) : (
              <></>
            )}
            {showNext ? (
              <button
                className="accent-button center"
                onClick={() => onNext()}
                style={{
                  width: 'fit-content',
                  minWidth: 65,
                  height: 20,
                  borderRadius: 3,
                  padding: 15,
                }}
              >
                {nextText}
              </button>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default DialogModal;
