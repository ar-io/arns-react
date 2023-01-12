import { useState } from 'react';

import { CopyIcon } from '../../../icons';

function CopyTextButton({
  displayText,
  copyText,
  size,
}: {
  displayText: string;
  copyText: string;
  size: number;
}) {
  const [textCopied, setTextCopied] = useState<boolean>(false);

  async function handleCopy() {
    setTextCopied(true);
    if (copyText) {
      await navigator.clipboard.writeText(copyText);
    }
    setTimeout(() => {
      setTextCopied(false);
    }, 2000);
  }

  return (
    <>
      <button
        className="button center tool-tip"
        style={{ textAlign: 'center' }}
        onClick={async () => {
          await handleCopy();
        }}
      >
        <span className="link bold center">
          {displayText}&nbsp;
          <CopyIcon height={size} width={size} fill="white" />
        </span>
      </button>
      {textCopied ? (
        <div
          className="bubble-small center black"
          style={{
            position: 'absolute',
            left: '50%',
            top: '2em',
            borderRadius: '6px',
            zIndex: '10',
          }}
        >
          Copied!
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default CopyTextButton;
