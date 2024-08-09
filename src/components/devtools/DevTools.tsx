import { useEffect, useState } from 'react';

import DialogModal from '../modals/DialogModal/DialogModal';
import ArNSRegistrySettings from './ArNSRegistrySettings';
import TransferIO from './TransferIO';
import './styles.css';

const DevTools = () => {
  const [isOpen, setIsOpen] = useState(false);

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
    <>
      {isOpen && (
        <div className="modal-container">
          <DialogModal
            title={<h2 className="white">ArNS Devtools</h2>}
            body={
              <div
                className="flex-column white flex"
                style={{
                  gap: '20px',
                  fontSize: '13px',
                  padding: '15px 0px',
                  paddingTop: '0px',
                  lineHeight: '1.5',
                  fontWeight: 160,
                  width: '600px',
                  height: '400px',
                  overflowY: 'auto',
                }}
              >
                <TransferIO />
                <ArNSRegistrySettings />
              </div>
            }
            onCancel={toggleModal}
            onClose={toggleModal}
            cancelText={'Close Devtools'}
          />
        </div>
      )}
    </>
  );
};

export default DevTools;
