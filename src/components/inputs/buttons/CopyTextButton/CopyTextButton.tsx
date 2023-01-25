import { useState } from 'react';

import { CopyIcon } from '../../../icons';

function CopyTextButton({
  displayText,
  copyText,
  size,
  wrapperStyle = {},
  position = 'absolute',
}: {
  displayText: string;
  copyText: string;
  size: number;
  wrapperStyle?: any;
  position?: 'static' | 'relative' | 'absolute' | 'sticky' | 'fixed';
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
    <div className="flex" style={{ position, ...wrapperStyle }}>
      <button
        className="flex flex-space-between button"
        style={{
          ...wrapperStyle,
        }}
        onClick={async () => {
          await handleCopy();
        }}
      >
        <span className="flex white center">{displayText}&nbsp;</span>
        <CopyIcon
          className="flex"
          height={size}
          width={size}
          fill="white"
          style={{ cursor: 'pointer' }}
        />
      </button>
      {textCopied ? (
        <div
          className="bubble-small text center black"
          style={{
            position: 'absolute',
            top: '100%',
            right: '0px',
            borderRadius: 'var(--corner-radius)',
            zIndex: '100',
          }}
        >
          Copied!
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default CopyTextButton;
