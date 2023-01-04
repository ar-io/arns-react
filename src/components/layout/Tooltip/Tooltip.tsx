import { useState } from 'react';

import { AlertCircle } from '../../icons';

export function Tooltip({
  message,
  children,
}: {
  message: string;
  children: JSX.Element;
}) {
  const [showToolTip, setShowToolTip] = useState(false);

  return (
    // eslint-disable-next-line
    <div
      className="section-header tool-tip"
      onClick={() => setShowToolTip(!showToolTip)}
    >
      {children}
      <AlertCircle width={'16px'} height={'16px'} fill={'var(--text-white)'} />
      {showToolTip ? (
        <div className="info-bubble">
          <span className="text bold black center">{message}</span>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
