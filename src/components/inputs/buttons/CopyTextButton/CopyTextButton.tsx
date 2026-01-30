import { Tooltip } from '@src/components/ui/Tooltip';
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
      /** this is an intermittent non-emitting notifying error that is hard to reproduce, but this SHOULD fix it
       * NotAllowedError: Document not focused
       */
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
    <div className="flex flex-row" style={{ position, ...wrapperStyle }}>
      <button
        className="button flex justify-center"
        style={{
          ...wrapperStyle,
          cursor: 'pointer',
          gap: '8px',
          padding: '0px',
        }}
        onClick={() => handleCopy()}
      >
        <span className="flex text-foreground text-center justify-center items-center" style={{ fontSize: 'inherit' }}>
          {body}&nbsp;
        </span>
        <Tooltip
          open={textCopied}
          content="Copied!"
          side="right"
          contentClassName="px-2 py-1 text-xs font-bold bg-foreground text-primary-foreground"
        >
          <div
            className="flex items-center justify-center"
            style={{
              cursor: 'pointer',
              scale: size,
              overflow: 'visible',
              ...copyButtonStyle,
            }}
          >
            <CopyIcon
              height={size ?? '15px'}
              width={size ?? '15px'}
              fill={'inherit'}
            />
          </div>
        </Tooltip>
      </button>
    </div>
  );
}

export default CopyTextButton;
