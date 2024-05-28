import { useState } from 'react';

import DialogModal from './DialogModal/DialogModal';

function NeedTokens() {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <button
        className={`flex-row navbar-link hover pointer`}
        style={{
          whiteSpace: 'nowrap',
          width: 'fit-content',
        }}
        onClick={() => setShowModal(true)}
      >
        Need test Tokens?
      </button>
      {showModal && (
        <div className="modal-container">
          <DialogModal
            title={
              <span
                className="text-medium bold"
                style={{ color: 'var(--accent)' }}
              >
                Need test Tokens?
              </span>
            }
            body={
              <div className="white" style={{ maxWidth: '600px' }}>
                tIO are the test tokens that power the AR.IO testnet. Test
                tokens are required to purchase an ArNS name. You can obtain
                tokens by joining the AR.IO Discord and requesting an
                application. Note that applications may be unavailable at any
                time during testnet.
              </div>
            }
            nextText="Close"
            onNext={() => setShowModal(false)}
            onClose={() => setShowModal(false)}
          />
        </div>
      )}
    </>
  );
}

export default NeedTokens;
