import React, { Suspense, useEffect, useState } from 'react';

import ANTTools from './ANTTools';
import TransferIO from './TransferIO';
import UserAddress from './UserAddress';

const ReactQueryDevtoolsProduction = React.lazy(() =>
  import('@tanstack/react-query-devtools/build/modern/production.js').then(
    (d) => ({
      default: d.ReactQueryDevtools,
    }),
  ),
) as any;

const DevTools = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTanstackTools, setShowTanstackTools] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (event: any) => {
    if (event.ctrlKey && event.shiftKey && event.key === 'Q') {
      toggleModal();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="flex flex-col w-full h-full text-sm p-2 overflow-y-auto">
      <div className="flex flex-row p-3 justify-between items-center">
        <h2 className="text-white text-lg font-semibold">Dev Tools</h2>
      </div>
      <UserAddress />
      <TransferIO />
      <ANTTools />
      <div className="flex flex-row gap-2 w-full justify-end">
        <button
          onClick={() => setShowTanstackTools(true)}
          className="border border-white rounded text-white p-2"
        >
          Enable Tanstack Query Tools
        </button>
      </div>

      {showTanstackTools && (
        <Suspense fallback={null}>
          <ReactQueryDevtoolsProduction
            onClose={() => {
              setShowTanstackTools(false);
            }}
          />
        </Suspense>
      )}
    </div>
  );
};

export default DevTools;
