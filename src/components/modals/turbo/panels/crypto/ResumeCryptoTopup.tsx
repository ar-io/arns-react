import { TurboSubmitFundTxResponse } from '@ardrive/turbo-sdk';
import PageLoader from '@src/components/layout/progress/PageLoader/PageLoader';
import { useTurboArNSClient } from '@src/hooks/useTurboArNSClient';
import { useWalletState } from '@src/state';
import { isEthAddress } from '@src/utils';
import { currencyLabels } from '@src/utils/constants';
import { useState } from 'react';

import { errorSubmittingTransactionToTurbo } from '../../TurboTopUpModal';

function ResumeCryptoTopup({ onBack }: { onBack: () => void }) {
  const [{ wallet }] = useWalletState();

  const turbo = useTurboArNSClient();

  const [paymentError, setPaymentError] = useState<string>();
  const [signingMessage, setSigningMessage] = useState<string>();
  const [transactionID, setTransactionID] = useState<string>('');
  const [response, setResponse] = useState<TurboSubmitFundTxResponse>();

  const submitTransactionToTurbo = async () => {
    setPaymentError(undefined);
    if (turbo) {
      setSigningMessage('Submitting Transaction to Turbo...');
      try {
        const response = await turbo.turboUploader.submitFundTransaction({
          txId: transactionID,
        });
        if (response.status === 'failed') {
          setPaymentError(errorSubmittingTransactionToTurbo);
        } else {
          setResponse(response);
        }
      } catch (e: unknown) {
        console.error(e);
        setPaymentError(errorSubmittingTransactionToTurbo);
      } finally {
        setSigningMessage(undefined);
      }
    }
  };

  const isComplete =
    response?.status === 'confirmed' || response?.status === 'pending';

  return (
    <div className="flex w-full h-full flex-col justify-between">
      {' '}
      <div className="flex size-full flex-col items-start gap-4 px-6 text-left my-8">
        <div className="pb-6">
          <span className="font-bold whitespace-nowrap">
            Resume{' '}
            {wallet?.tokenType ? currencyLabels[wallet.tokenType] : 'Token'}{' '}
            Topup
          </span>
        </div>

        {response && isComplete ? (
          <div className="w-full flex-col items-center gap-2 text-sm">
            Transaction submitted to Turbo. Your account will be credited
            shortly.
          </div>
        ) : (
          <div className="w-full flex-col items-center gap-2 text-sm">
            <div className="text-sm whitespace-nowrap">
              Enter{' '}
              {wallet?.tokenType ? currencyLabels[wallet.tokenType] : 'TOKEN'}{' '}
              Transaction ID below and submit to Turbo for credits.
            </div>
            <div className="text-sm">
              <input
                type="text"
                placeholder={`${
                  wallet?.tokenType ? currencyLabels[wallet.tokenType] : ''
                } Transaction ID`}
                className={`mt-2 flex w-full gap-2 rounded border-2 border-dark-grey bg-transparent outline-none py-2 pr-4 pl-4 ${
                  paymentError ? 'border-error' : ''
                }`}
                value={transactionID || ''}
                onChange={(e) => {
                  setTransactionID(e.target.value.trim());
                  setPaymentError(undefined);
                }}
              ></input>
            </div>
          </div>
        )}

        <div className="w-full text-right text-sm text-error min-h-5">
          {paymentError ?? null}
        </div>

        {signingMessage && (
          <PageLoader loading={true} message={signingMessage} />
        )}
      </div>
      <div className="flex gap-2 w-full justify-end border-t border-dark-grey py-3 mt-4 px-6">
        <button
          className="text-grey hover:text-white px-4 py-2 rounded"
          onClick={onBack}
        >
          Back
        </button>

        <button
          disabled={!transactionID}
          className="text-black border border-dark-grey bg-primary px-4 py-2 rounded disabled:opacity-50"
          onClick={() => {
            if (isEthAddress(transactionID)) {
              submitTransactionToTurbo();
            } else {
              setPaymentError('Invalid Transaction ID');
            }
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default ResumeCryptoTopup;
