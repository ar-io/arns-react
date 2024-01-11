import { Tooltip } from 'antd';
import { useState } from 'react';

import { CopyIcon } from '../../../icons';
import './styles.css';

function CopyTextButton({
  body,
  copyText,
  size,
  wrapperStyle = {},
  position = 'absolute',
  copyButtonStyle,
}: {
  body: JSX.Element | string;
  copyText: string;
  size: number | string;
  wrapperStyle?: any;
  position?: 'static' | 'relative' | 'absolute' | 'sticky' | 'fixed';
  copyButtonStyle?: any;
}) {
  const [textCopied, setTextCopied] = useState<boolean>(false);

  async function handleCopy() {
    if (!document.hasFocus()) {
      // this is an intermittent non-emitting notifying error that is hard to reproduce, but this SHOULD fix it
      //https://permanent-data-solutions-e7.sentry.io/issues/4421686865/?project=4504894571085824&query=is%3Aunresolved&referrer=issue-stream&statsPeriod=14d&stream_index=3
      return;
    }
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
        onClick={() => handleCopy()}
      >
        <span className="flex white center" style={{ fontSize: 'inherit' }}>
          {body}&nbsp;
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
            className="flex"
            height={size ?? '15px'}
            width={size ?? '15px'}
            fill={'inherit'}
            style={{
              cursor: 'pointer',
              scale: size,
              overflow: 'visible',
              ...copyButtonStyle,
            }}
          />
        </Tooltip>
      </button>
    </div>
  );
}

export default CopyTextButton;
