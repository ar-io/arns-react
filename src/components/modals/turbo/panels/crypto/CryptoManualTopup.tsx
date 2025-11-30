import { TokenType, TurboFactory } from '@ardrive/turbo-sdk/web';
import { CopyIcon } from '@src/components/icons';
import { useGlobalState, useWalletState } from '@src/state';
import { TOKEN_DISPLAY_INFO, currencyLabels } from '@src/utils/constants';
import { AlertTriangle, CheckCircle, Copy, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { CryptoTopupQuote } from './CryptoConfirmation';

interface CryptoManualTopupProps {
  quote: CryptoTopupQuote;
  onBack: () => void;
  onComplete: () => void;
}

interface TransferResult {
  txid: string;
  explorerURL: string;
}

function CryptoManualTopup({
  quote,
  onBack,
  onComplete,
}: CryptoManualTopupProps) {
  const [{ wallet }] = useWalletState();
  const [{ turboNetwork }] = useGlobalState();

  const [turboWalletAddress, setTurboWalletAddress] = useState<string>();
  const [transferResult, setTransferResult] = useState<TransferResult>();
  const [transactionSubmitted, setTransactionSubmitted] = useState(false);
  const [paymentError, setPaymentError] = useState<string>();
  const [signingMessage, setSigningMessage] = useState<string>();
  const [isRetrying, setIsRetrying] = useState(false);
  const [copied, setCopied] = useState(false);

  // Refs to track timeouts for cleanup on unmount
  const autoCompleteTimeoutRef = useRef<NodeJS.Timeout>();
  const copyTimeoutRef = useRef<NodeJS.Timeout>();

  // Cleanup timeouts on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (autoCompleteTimeoutRef.current) {
        clearTimeout(autoCompleteTimeoutRef.current);
      }
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Fetch Turbo wallet address for the token type
  useEffect(() => {
    async function fetchTurboWallet() {
      try {
        const response = await fetch(`${turboNetwork.PAYMENT_URL}/info`);
        const data = await response.json();
        const address = data.addresses?.[quote.tokenType];
        setTurboWalletAddress(address);
      } catch (e) {
        console.error('Failed to fetch Turbo wallet address:', e);
      }
    }

    fetchTurboWallet();
  }, [turboNetwork.PAYMENT_URL, quote.tokenType]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  // Step 1: Submit native transaction (send crypto to Turbo wallet)
  const submitNativeTransaction = async () => {
    if (!wallet?.submitNativeTransaction || !turboWalletAddress) {
      setPaymentError('Wallet does not support native transactions');
      return;
    }

    setPaymentError(undefined);
    setSigningMessage(
      'Signing transaction with your wallet and awaiting confirmation...',
    );

    try {
      const response = await wallet.submitNativeTransaction(
        quote.tokenAmount,
        turboWalletAddress,
      );
      setTransferResult(response);
    } catch (e: unknown) {
      console.error(e);
      setPaymentError(
        'Error submitting transaction. Please try again or contact support.',
      );
    } finally {
      setSigningMessage(undefined);
    }
  };

  // Step 2: Submit transaction to Turbo
  const submitTransactionToTurbo = async () => {
    if (!transferResult) return;

    setPaymentError(undefined);
    setSigningMessage('Submitting transaction to Turbo...');

    try {
      const turboClient = TurboFactory.unauthenticated({
        paymentServiceConfig: {
          url: turboNetwork.PAYMENT_URL,
        },
        token: quote.tokenType,
      });

      const response = await turboClient.submitFundTransaction({
        txId: transferResult.txid,
      });

      if (response.status === 'failed') {
        setPaymentError(
          'Error submitting transaction to Turbo. Please try again or contact support.',
        );
      } else {
        setTransactionSubmitted(true);
        // Auto-complete after successful submission
        autoCompleteTimeoutRef.current = setTimeout(() => {
          onComplete();
        }, 2000);
      }
    } catch (e: unknown) {
      console.error(e);
      setPaymentError(
        'Error submitting transaction to Turbo. Please try again or contact support.',
      );
    } finally {
      setSigningMessage(undefined);
    }
  };

  // Retry failed transaction
  const retryTransaction = async () => {
    if (!transferResult) return;

    setIsRetrying(true);
    setPaymentError(undefined);
    setSigningMessage('Retrying transaction submission...');

    try {
      const turboClient = TurboFactory.unauthenticated({
        paymentServiceConfig: {
          url: turboNetwork.PAYMENT_URL,
        },
        token: quote.tokenType,
      });

      const response = await turboClient.submitFundTransaction({
        txId: transferResult.txid,
      });

      if (response.status === 'failed') {
        setPaymentError('Transaction retry failed. Please contact support.');
      } else {
        setTransactionSubmitted(true);
        autoCompleteTimeoutRef.current = setTimeout(() => {
          onComplete();
        }, 2000);
      }
    } catch (e: unknown) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      setPaymentError(`Retry failed: ${errorMessage}`);
    } finally {
      setIsRetrying(false);
      setSigningMessage(undefined);
    }
  };

  const formatAddress = (address: string, count = 8) => {
    return `${address.slice(0, count)}...${address.slice(-count)}`;
  };

  const tokenLabel = currencyLabels[quote.tokenType] || quote.tokenType;
  const networkLabel =
    TOKEN_DISPLAY_INFO[quote.tokenType]?.network || 'Unknown';

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Header */}
      <div className="flex flex-col items-start border-b border-dark-grey py-3 px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <Copy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="font-bold text-white">Submit Transactions</div>
            <div className="text-sm text-grey">
              Complete your {tokenLabel} payment on {networkLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Amount Summary */}
      <div className="py-3 px-6">
        <div className="bg-primary/10 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary">
            {quote.tokenAmount.toFixed(6)} {tokenLabel}
          </div>
          <div className="text-sm text-grey">Payment amount required</div>
        </div>
      </div>

      {/* Step 1 - Send Payment */}
      <div className="px-6">
        <div className="bg-dark-grey rounded-lg border border-grey/20">
          <div className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  !transferResult
                    ? 'bg-primary text-black'
                    : 'bg-success text-white'
                }`}
              >
                {transferResult ? '✓' : '1'}
              </div>
              <div>
                <h4 className="font-medium text-white">
                  Send {tokenLabel} to Turbo
                </h4>
                <p className="text-sm text-grey">
                  Transfer {quote.tokenAmount.toFixed(6)} {tokenLabel} from your
                  wallet
                </p>
              </div>
            </div>

            {!transferResult ? (
              <div className="space-y-4">
                <div className="bg-background rounded-lg p-4 border border-grey/20">
                  <p className="text-sm text-grey mb-2">
                    This step sends {tokenLabel} to Turbo. You can verify the
                    recipient is Turbo's wallet address{' '}
                    <a
                      href={`${turboNetwork.PAYMENT_URL}/info`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 underline"
                    >
                      here
                    </a>
                    .
                  </p>
                  {turboWalletAddress && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-grey">Turbo Wallet:</span>
                      <code className="text-xs text-white bg-dark-grey px-2 py-1 rounded">
                        {formatAddress(turboWalletAddress)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(turboWalletAddress)}
                        className="text-grey hover:text-white"
                      >
                        {copied ? (
                          <CheckCircle className="w-4 h-4 text-success" />
                        ) : (
                          <CopyIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={submitNativeTransaction}
                  disabled={!turboWalletAddress || !!signingMessage}
                  className="w-full px-6 py-3 rounded-lg bg-primary text-black font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {signingMessage ? signingMessage : 'Send Payment'}
                </button>
              </div>
            ) : (
              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-success mb-2">
                      Transaction Success
                    </p>
                    <div className="text-sm text-success/80 space-y-2">
                      <div className="flex items-center gap-2">
                        <span>Transaction ID:</span>
                        <a
                          href={transferResult.explorerURL}
                          className="text-success underline hover:text-success/80"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {formatAddress(transferResult.txid)}
                        </a>
                        <button
                          onClick={() => copyToClipboard(transferResult.txid)}
                          className="text-success/80 hover:text-success"
                        >
                          <CopyIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs">
                        Please record this transaction ID for your records.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step 2 - Submit to Turbo */}
      {transferResult && (
        <div className="px-6">
          <div className="bg-dark-grey rounded-lg border border-grey/20">
            <div className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    !transactionSubmitted
                      ? 'bg-primary text-black'
                      : 'bg-success text-white'
                  }`}
                >
                  {transactionSubmitted ? '✓' : '2'}
                </div>
                <div>
                  <h4 className="font-medium text-white">
                    Submit Transaction to Turbo
                  </h4>
                  <p className="text-sm text-grey">
                    Confirm your transaction with Turbo's payment service
                  </p>
                </div>
              </div>

              {!transactionSubmitted ? (
                <div className="space-y-4">
                  <div className="bg-background rounded-lg p-4 border border-grey/20">
                    <p className="text-sm text-grey">
                      This step submits your transaction to Turbo for
                      processing. Once submitted, your credits will be added to
                      your account.
                    </p>
                  </div>

                  <button
                    onClick={submitTransactionToTurbo}
                    disabled={!!signingMessage}
                    className="w-full px-6 py-3 rounded-lg bg-primary text-black font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {signingMessage ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        {signingMessage}
                      </>
                    ) : (
                      'Submit to Turbo'
                    )}
                  </button>
                </div>
              ) : (
                <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div className="text-success text-sm">
                      <p className="font-medium mb-1">Payment Complete!</p>
                      <p>Your account will be credited shortly.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {paymentError && (
        <div className="px-6">
          <div className="bg-error/10 border border-error/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-error text-sm">{paymentError}</div>
                {transferResult && !transactionSubmitted && (
                  <button
                    onClick={retryTransaction}
                    disabled={isRetrying}
                    className="mt-3 flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`}
                    />
                    {isRetrying ? 'Retrying...' : 'Retry Transaction'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 w-full justify-between border-t border-dark-grey py-3 mt-4 px-6">
        <button
          onClick={onBack}
          disabled={transactionSubmitted || !!signingMessage}
          className="text-grey hover:text-white text-sm disabled:opacity-50"
        >
          Back
        </button>

        {transactionSubmitted && (
          <button
            onClick={onComplete}
            className="text-black bg-primary px-4 py-2 rounded font-medium hover:bg-primary/90"
          >
            Complete
          </button>
        )}
      </div>

      {/* Signing Overlay */}
      {signingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-metallic-grey p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span className="text-white">{signingMessage}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CryptoManualTopup;
