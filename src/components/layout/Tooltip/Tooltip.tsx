import { useState } from 'react';

import { AlertCircle } from '../../icons';

export function Tooltip({
  message,
  children,
}: {
  message: string;
  children: JSX.Element[];
}) {
  const [showToolTip, setShowToolTip] = useState(false);

  return (
    // eslint-disable-next-line
    <div
      className="flex flex-column tool-tip"
      onClick={() => setShowToolTip(!showToolTip)}
    >
      {children}
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
