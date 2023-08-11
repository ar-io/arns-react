import { Tooltip } from 'antd';
import { useState } from 'react';

import { CopyIcon } from '../../../icons';
import './styles.css';

function CopyTextButton({
  displayText,
  copyText,
  size,
  wrapperStyle = {},
  position = 'absolute',
}: {
  displayText: JSX.Element | string;
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
    }, 500);
  }

  return (
    <div className="flex" style={{ position, ...wrapperStyle }}>
      <button
        className="flex flex-space-between button"
        style={{
          ...wrapperStyle,
          cursor: 'pointer',
          gap: '8px',
          padding: '0px',
        }}
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
          overlayClassName="copy-tooltip"
          overlayInnerStyle={{
            color: 'var(--text-black)',
            boxShadow: 'var(--shadow)',
            fontFamily: 'Rubik-Bold',
            backgroundColor: 'var(--text-white)',
            fontSize: '10px',
            display: 'flex',
            justifyContent: 'center',
            borderRadius: 'var(--corner-radius)',
            padding: '4px 8px',
          }}
        >
          <CopyIcon
            className="flex hover"
            height={size ?? 15}
            width={size ?? 15}
            fill={'inherit'}
            style={{ cursor: 'pointer', scale: size }}
          />
        </Tooltip>
      </button>
    </div>
  );
}

export default CopyTextButton;
