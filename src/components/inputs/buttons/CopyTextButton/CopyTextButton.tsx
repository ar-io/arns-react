import { Tooltip } from 'antd';
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
  size: number | string;
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
        style={{ ...wrapperStyle, cursor: 'pointer' }}
        onClick={async () => {
          await handleCopy();
        }}
      >
        <span className="flex white center" style={{ fontSize: 'inherit' }}>
          {displayText}&nbsp;
        </span>

        <Tooltip
          open={textCopied}
          title={'Copied!'}
          placement="right"
          autoAdjustOverflow={true}
          arrow={false}
          overlayInnerStyle={{
            color: 'var(--text-black)',
            fontFamily: 'Rubik-Bold',
            backgroundColor: 'var(--text-white)',
          }}
        >
          <CopyIcon
            className="flex"
            height={25}
            width={25}
            fill="white"
            style={{ cursor: 'pointer', scale: size }}
          />
        </Tooltip>
      </button>
    </div>
  );
}

export default CopyTextButton;
