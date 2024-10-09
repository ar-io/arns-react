import eventEmitter from '@src/utils/events';
import { useEffect, useState } from 'react';

function NetworkStatusBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  const [aoCongested, setAoCongested] = useState(false);

  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    window.addEventListener('online', () => setOnline(true));
    window.addEventListener('offline', () => setOnline(false));

    const updateAoCongested = async () => {
      setAoCongested(true);
      setTimeout(() => setAoCongested(false), 1000 * 60 * 3); // 3 minutes
    };

    eventEmitter.on('network:ao:congested', updateAoCongested);
    // Cleanup listeners
    return () => {
      window.removeEventListener('online', () => setOnline(true));
      window.removeEventListener('offline', () => setOnline(false));
      eventEmitter.off('network:ao:congested', updateAoCongested);
    };
  }, []);

  useEffect(() => {
    updateStatusMessage();
  }, [online, aoCongested]);

  function updateStatusMessage() {
    if (!online) {
      setStatusMessage(`We can't connect to the Internet. Please check your connection
            and try again.`);
    } else if (aoCongested) {
      setStatusMessage(
        'The AO network is experiencing congestion, load times may be longer than usual.',
      );
    } else {
      setStatusMessage('');
    }
  }

  return (
    <>
      {statusMessage && (
        <div className="flex flex-row items-center justify-center p-2 text-black text-sm font-sans-bold bg-primary">
          <span>{statusMessage}</span>
        </div>
      )}
    </>
  );
}

export default NetworkStatusBanner;
